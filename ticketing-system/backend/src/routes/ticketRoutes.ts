import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { db } from '../db';
import { authMiddleware } from '../middleware/authMiddleware';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

dotenv.config();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const commentUpload = multer({ dest: 'uploads/comments/' });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // ✅ for testing or self-signed certs
  },
});

// CREATE TICKET WITH PRIORITY
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  const { subject, description, priority } = req.body;
  const filePath = req.file?.filename || null;
  const userId = req.user!.id;

  await db.query(
    'INSERT INTO tickets (user_id, subject, description, file, status, priority) VALUES ($1, $2, $3, $4, $5, $6)',
    [userId, subject, description, filePath, 'open', priority || 'High']
  );

  const { rows: [user] } = await db.query('SELECT email FROM users WHERE id = $1', [userId]);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: '🎫 Ticket Received',
    text: `Your ticket "${subject}" has been received.`,
  });

  // Get admin email from users table
  const { rows: [admin] } = await db.query("SELECT email FROM users WHERE role = 'admin' LIMIT 1");

  if (admin) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: '🚨 New Ticket Submitted',
      text: `New ticket titled "${subject}" was submitted by ${user.email}.`,
    });
  }

  res.json({ message: 'Ticket created' });
});

// USER TICKETS
router.get('/', authMiddleware, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM tickets WHERE user_id = $1', [req.user!.id]);
  res.json(rows);
});

// ALL TICKETS (ADMIN)
router.get('/all', authMiddleware, async (req, res) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

  const { escalated } = req.query;
  const query = `
    SELECT tickets.*, u1.name, u1.email, u2.name AS agent_name
    FROM tickets
    JOIN users u1 ON tickets.user_id = u1.id
    LEFT JOIN users u2 ON tickets.assigned_to = u2.id
    ${escalated === 'true' ? 'WHERE tickets.needs_escalation = TRUE' : ''}
    ORDER BY tickets.id DESC
  `;

  const { rows } = await db.query(query);
  res.json(rows);
});

// ASSIGNED TICKETS
router.get('/assigned', authMiddleware, async (req, res) => {
  const { rows } = await db.query(`
    SELECT tickets.*, users.name, users.email
    FROM tickets
    JOIN users ON tickets.user_id = users.id
    WHERE tickets.assigned_to = $1
    ORDER BY tickets.id DESC
  `, [req.user!.id]);
  res.json(rows);
});

// TOGGLE STATUS
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const ticketId = req.params.id;
  const { rows: [ticket] } = await db.query('SELECT status FROM tickets WHERE id = $1', [ticketId]);

  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const newStatus = ticket.status === 'open' ? 'closed' : 'open';
  await db.query('UPDATE tickets SET status = $1 WHERE id = $2', [newStatus, ticketId]);

  res.json({ message: `Status updated to ${newStatus}` });
});

// ASSIGN TICKET
router.patch('/:id/assign', authMiddleware, async (req, res) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

  const ticketId = req.params.id;
  const { assigned_to } = req.body;

  await db.query('UPDATE tickets SET assigned_to = $1 WHERE id = $2', [assigned_to, ticketId]);
  res.json({ message: 'Assigned successfully' });
});

// ESCALATE TICKET
router.patch('/:id/escalate', authMiddleware, async (req, res) => {
  if (req.user!.role !== 'agent') return res.status(403).json({ error: 'Only agents can escalate' });

  const ticketId = req.params.id;
  await db.query('UPDATE tickets SET needs_escalation = TRUE WHERE id = $1', [ticketId]);

  const { rows: [admin] } = await db.query("SELECT email FROM users WHERE role = 'admin' LIMIT 1");

  if (admin) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: '🚨 Ticket Escalated',
      text: `Ticket ID ${ticketId} has been escalated by ${req.user!.email}`,
    });
  }

  res.json({ message: 'Escalated & admin notified' });
});

// COMMENTS: GET
router.get('/:id/comments', authMiddleware, async (req, res) => {
  const ticketId = req.params.id;
  const { rows } = await db.query(`
    SELECT comments.*, users.name, users.role
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE comments.ticket_id = $1
    ORDER BY comments.created_at ASC
  `, [ticketId]);
  res.json(rows);
});

// COMMENTS: POST
router.post('/:id/comments', authMiddleware, commentUpload.single('file'), async (req, res) => {
  const { message, parent_id } = req.body;
  const file = req.file?.filename;
  const ticketId = req.params.id;
  const userId = req.user!.id;

  await db.query(
    'INSERT INTO comments (ticket_id, user_id, message, parent_id, attachment) VALUES ($1, $2, $3, $4, $5)',
    [ticketId, userId, message, parent_id || null, file || null]
  );

  res.json({ message: 'Comment added' });
});

// COMMENTS: EDIT
router.patch('/comments/:id/edit', authMiddleware, async (req, res) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

  const commentId = req.params.id;
  const { message } = req.body;

  await db.query(
    'UPDATE comments SET message = $1, edited_at = CURRENT_TIMESTAMP WHERE id = $2',
    [message, commentId]
  );

  res.json({ message: 'Edited' });
});

// COMMENTS: DELETE
router.delete('/comments/:id', authMiddleware, async (req, res) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

  const commentId = req.params.id;
  await db.query('DELETE FROM comments WHERE id = $1', [commentId]);

  res.json({ message: 'Deleted' });
});

// EXPORT TICKET + COMMENTS TO PDF
router.get('/:id/export/pdf', authMiddleware, async (req, res) => {
  const ticketId = req.params.id;

  const { rows: [ticket] } = await db.query(`
    SELECT tickets.*, users.name, users.email
    FROM tickets
    JOIN users ON tickets.user_id = users.id
    WHERE tickets.id = $1
  `, [ticketId]);

  const { rows: comments } = await db.query(`
    SELECT comments.*, users.name AS author
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE ticket_id = $1
    ORDER BY created_at ASC
  `, [ticketId]);

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ticket_${ticketId}.pdf`);
  doc.pipe(res);

  doc.fontSize(16).text(`Ticket: ${ticket.subject}`, { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Description: ${ticket.description}`);
  doc.text(`Priority: ${ticket.priority}`);
  doc.text(`Submitted by: ${ticket.name} (${ticket.email})`);
  doc.moveDown();
  doc.fontSize(14).text('Comments:', { underline: true });

  comments.forEach((c: any) => {
    doc.fontSize(12).text(`${c.author} [${c.created_at}]:`);
    doc.text(c.message);
    doc.moveDown();
  });

  doc.end();
});

export default router;
