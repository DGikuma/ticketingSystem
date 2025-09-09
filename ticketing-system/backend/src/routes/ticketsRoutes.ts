import { Router, Request, Response } from "express";
import { db } from "../db";
import { authMiddleware } from "../middleware/authMiddleware";
import { getTickets } from "../api/tickets/ticket";

const router = Router();

/**
 * ✅ Create new ticket
 */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const { title, description, priority, created_by } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO tickets (title, description, priority, created_by, status) VALUES ($1, $2, $3, $4, 'open') RETURNING *",
      [title, description, priority, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creating ticket:", err);
    res.status(500).json({ message: "Failed to create ticket" });
  }
});

/**
 * ✅ Get all tickets (using controller for clean enriched data)
 */
router.get("/", authMiddleware, getTickets);

/**
 * ✅ Get single ticket details
 */
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM tickets WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching ticket:", err);
    res.status(500).json({ message: "Failed to fetch ticket" });
  }
});

/**
 * ✅ Assign ticket to an agent
 */
router.patch("/:id/assign", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { agentId } = req.body;

  if (!agentId) {
    return res.status(400).json({ message: "agentId is required" });
  }

  try {
    // ✅ Check ticket exists
    const ticketRes = await db.query("SELECT id FROM tickets WHERE id = $1", [id]);
    if (ticketRes.rowCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ✅ Check agent exists
    const agentRes = await db.query(
      "SELECT id, name FROM users WHERE id = $1 AND role = 'agent'",
      [agentId]
    );
    if (agentRes.rowCount === 0) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // ✅ Update ticket assignment and return updated ticket
    const updatedTicket = await db.query(
      "UPDATE tickets SET assigned_to = $1 WHERE id = $2 RETURNING *",
      [agentId, id]
    );

    res.json({
      assigned_to_name: agentRes.rows[0].name,
      ticket: updatedTicket.rows[0],
    });
  } catch (error) {
    console.error("❌ Error assigning ticket:", error);
    res.status(500).json({ message: "Failed to assign ticket" });
  }
});

/**
 * ✅ Escalate ticket
 */
router.patch("/:id/escalate", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "UPDATE tickets SET escalated = TRUE WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error escalating ticket:", err);
    res.status(500).json({ message: "Failed to escalate ticket" });
  }
});

/**
 * ✅ Update ticket status
 */
router.patch("/:id/status", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "status is required" });
  }

  try {
    const result = await db.query(
      "UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error updating ticket status:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

/**
 * ✅ Add comment to ticket
 */
router.post("/:id/comments", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, comment } = req.body;

  if (!comment) {
    return res.status(400).json({ message: "comment is required" });
  }

  try {
    // Ensure ticket exists
    const ticketRes = await db.query("SELECT id FROM tickets WHERE id = $1", [id]);
    if (ticketRes.rowCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const result = await db.query(
      "INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES ($1, $2, $3) RETURNING *",
      [id, userId, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error adding comment:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

/**
 * ✅ Get comments for a ticket
 */
router.get("/:id/comments", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "SELECT c.*, u.name AS user_name FROM ticket_comments c JOIN users u ON c.user_id = u.id WHERE c.ticket_id = $1 ORDER BY c.created_at ASC",
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching comments:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

export default router;
