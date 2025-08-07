import express from 'express';
import { db } from '../db';
const router = express.Router();

// Fetch all users
router.get('/', async (_, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, department FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err });
  }
});

// Fetch agents only
router.get('/agents', async (_, res) => {
  try {
    const result = await db.query('SELECT id, name FROM users WHERE role = $1', ['agent']);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agents', error: err });
  }
});

// Fetch single user by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.params.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err });
  }
});

export default router;
