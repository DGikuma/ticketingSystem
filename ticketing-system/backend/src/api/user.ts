import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { db } from '../db';

const router = express.Router();

// GET /api/users - Fetch all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user!;
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const result = await db.query('SELECT id, name, email, role, department FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
