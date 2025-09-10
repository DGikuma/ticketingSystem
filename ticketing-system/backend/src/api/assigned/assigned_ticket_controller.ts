import { Request, Response } from "express";
import { db } from "../../db";

// ✅ Helper: normalize ticket ID (accepts string/number)
const normalizeId = (id: string | number): number | null => {
  if (!id) return null;
  const parsed = parseInt(id as string, 10);
  return isNaN(parsed) ? null : parsed;
};

// ✅ Get tickets assigned to current user
export const getAssignedTickets = async (req: Request, res: Response) => {
  console.log("⏩ getAssignedTickets called");
  console.log("User from middleware:", (req as any).user);

  try {
    const userId = (req as any).user.id;
    console.log("Fetching tickets for userId:", userId);

    const tickets = await db.query(
      `SELECT t.id, t.subject, t.status, t.created_at as "createdAt",
              t.description, t.priority,
              u.id as "agentId", u.name as "agentName", u.email as "agentEmail"
       FROM tickets t
       JOIN users u ON u.id = t.assigned_to
       WHERE u.id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    console.log("Tickets fetched:", tickets.rows.length);
    res.json({ tickets: tickets.rows });
  } catch (err) {
    console.error("❌ Error fetching tickets", err);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
};

// ✅ Get single ticket with comments + attachments
export const getTicketById = async (req: Request, res: Response) => {
  console.log("⏩ getTicketById called");
  console.log("Request params:", req.params);

  try {
    const ticketId = normalizeId(req.params.id);
    if (!ticketId) {
      console.warn("Invalid ticket ID:", req.params.id);
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    const ticket = await db.query(
      `SELECT t.id, t.subject, t.status, t.created_at as "createdAt",
              t.description, t.priority,
              u.id as "agentId", u.name as "agentName", u.email as "agentEmail"
       FROM tickets t
       LEFT JOIN users u ON u.id = t.assigned_to
       WHERE t.id = $1`,
      [ticketId]
    );

    if (ticket.rowCount === 0) {
      console.warn("Ticket not found for ID:", ticketId);
      return res.status(404).json({ error: "Ticket not found" });
    }

    const comments = await db.query(
      `SELECT c.id, c.comment, c.created_at as "createdAt",
              u.id as "userId", u.name as "userName"
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.ticket_id = $1
       ORDER BY c.created_at ASC`,
      [ticketId]
    );

    const attachments = await db.query(
      `SELECT id, file_name as "fileName", file_url as "fileUrl"
       FROM attachments
       WHERE ticket_id = $1`,
      [ticketId]
    );

    res.json({
      ...ticket.rows[0],
      comments: comments.rows,
      attachments: attachments.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching ticket:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Update ticket details
export const updateTicket = async (req: Request, res: Response) => {
  console.log("⏩ updateTicket called");
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);

  try {
    const ticketId = normalizeId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    const { subject, description, status, priority, assigned_to } = req.body;

    const updates: { [key: string]: any } = {};
    if (subject !== undefined) updates.subject = subject;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;

    if (assigned_to !== undefined) {
      const assignedInt = normalizeId(assigned_to);
      if (assignedInt) {
        updates.assigned_to = assignedInt;
      } else {
        return res.status(400).json({ error: "assigned_to must be a valid integer" });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const setClauses = Object.keys(updates).map(
      (key, idx) => `${key} = $${idx + 1}`
    );
    const values = Object.values(updates);
    setClauses.push(`updated_at = now()`);

    const query = `
      UPDATE tickets 
      SET ${setClauses.join(", ")}
      WHERE id = $${values.length + 1}
      RETURNING *;
    `;

    const { rows } = await db.query(query, [...values, ticketId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error updating ticket:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Add comment
export const addComment = async (req: Request, res: Response) => {
  console.log("⏩ addComment called");
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);
  console.log("User from middleware:", (req as any).user);

  try {
    const ticketId = normalizeId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    const userId = (req as any).user.id;
    const { comment } = req.body;

    const result = await db.query(
      `INSERT INTO comments (ticket_id, user_id, comment, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, comment, created_at as "createdAt"`,
      [ticketId, userId, comment]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error adding comment", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};
