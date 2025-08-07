// src/routes/userTickets.ts
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/user', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user;

  if (!user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await db.query(
      `SELECT * FROM tickets WHERE created_by = $1 ORDER BY created_at DESC`,
      [user.email]
    );
    res.status(200).json({ tickets: result.rows });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
