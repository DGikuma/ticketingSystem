import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Request Reset Link
router.post('/requestReset', async (req, res) => {
  const { email } = req.body;

  const { rows: [user] } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

  await db.query(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, token, expires_at]
  );

  const resetUrl = `http://localhost:3000/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔐 Password Reset',
    text: `Click to reset your password: ${resetUrl}`,
  });

  res.json({ message: 'Password reset email sent' });
});

// 🔹 Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const { rows: [reset] } = await db.query(
    'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()',
    [token]
  );

  if (!reset) return res.status(400).json({ error: 'Invalid or expired token' });

  const hashed = await bcrypt.hash(password, 10);
  await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, reset.user_id]);
  await db.query('DELETE FROM password_resets WHERE user_id = $1', [reset.user_id]);

  res.json({ message: 'Password updated successfully' });
});

export default router;
