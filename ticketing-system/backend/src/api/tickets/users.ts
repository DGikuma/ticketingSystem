import { Request, Response } from 'express';
import { db } from '../../db';
import { authMiddleware } from '../../middleware/authMiddleware';

export const getUserTickets = [
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;

      if (!user || !user.email) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await db.query(
        'SELECT * FROM tickets WHERE created_by = $1 ORDER BY created_at DESC',
        [user.email]
      );

      return res.status(200).json({ tickets: result.rows });
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
];
