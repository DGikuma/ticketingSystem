import { Router, Request, Response } from "express";
import { db } from "../db";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const { status, startDate, endDate } = req.query;

  try {
    let conditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (status && typeof status === "string" && ["Open", "Pending", "Closed"].includes(status)) {
      conditions.push(`t.status = $${paramIndex++}`);
      params.push(status);
    }

    if (startDate && typeof startDate === "string") {
      conditions.push(`t.created_at >= $${paramIndex++}`);
      params.push(new Date(startDate));
    }

    if (endDate && typeof endDate === "string") {
      conditions.push(`t.created_at <= $${paramIndex++}`);
      params.push(new Date(endDate));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // ✅ fetch total count (for pagination metadata)
    const countQuery = await db.query(
      `SELECT COUNT(*) FROM tickets t ${whereClause}`,
      params
    );
    const total = parseInt(countQuery.rows[0].count, 10);

    // ✅ fetch paginated tickets
    const query = `
      SELECT t.id, t.subject, t.status, t.created_at,
             u.name AS assigned_to_name
      FROM tickets t
      LEFT JOIN users u ON t.assigned_to = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const result = await db.query(query, [...params, limit, offset]);

    res.json({
      data: result.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

/**
 * POST /api/tickets/:id/assign
 * Assign a ticket to an agent
 */
router.post("/:id/assignTicket", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { agentId } = req.body;

  if (!agentId) {
    return res.status(400).json({ message: "agentId is required" });
  }

  try {
    // ✅ Check if ticket exists
    const ticketRes = await db.query("SELECT id FROM tickets WHERE id = $1", [id]);
    if (ticketRes.rowCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ✅ Verify agent exists and has role = 'agent'
    const agentRes = await db.query(
      "SELECT id, name FROM users WHERE id = $1 AND role = 'agent'",
      [agentId]
    );
    if (agentRes.rowCount === 0) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // ✅ Assign ticket
    await db.query("UPDATE tickets SET assigned_to = $1 WHERE id = $2", [
      agentId,
      id,
    ]);

    res.json({ assigned_to_name: agentRes.rows[0].name });
  } catch (err) {
    console.error("❌ Error assigning ticket:", err);
    res.status(500).json({ message: "Failed to assign ticket" });
  }
});

export default router;
