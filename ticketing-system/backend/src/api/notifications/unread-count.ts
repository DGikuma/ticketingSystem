import express from 'express';
import { db } from '../../db'; // adjust path based on your structure
import { authMiddleware } from '../../middleware/authMiddleware';

const router = express.Router();

// GET /api/notification/unread-count
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    // Get tickets assigned to this user
    const ticketsResult = await db.query(
      `SELECT id FROM tickets WHERE assigned_to = $1`,
      [userId]
    );

    const ticketIds = ticketsResult.rows.map(row => row.id);

    if (ticketIds.length === 0) {
      return res.json({ unreadCount: 0 });
    }

    // Count unread comments (exclude agent's own comments)
    const unreadResult = await db.query(
      `
      SELECT COUNT(*) FROM comments
      WHERE ticket_id = ANY($1::int[])
        AND user_id != $2
        AND created_at > (
          SELECT COALESCE(MAX(updated_at), '1970-01-01')
          FROM tickets 
          WHERE tickets.id = comments.ticket_id
        )
      `,
      [ticketIds, userId]
    );

    const unreadCount = parseInt(unreadResult.rows[0].count, 10);
    return res.json({ unreadCount });
  } catch (error) {
    console.error('Unread notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
