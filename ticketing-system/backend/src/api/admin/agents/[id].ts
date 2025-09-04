import { Router, Request, Response } from "express";
import { db } from "../../../db"; // adjust path if needed

const router = Router();

/**
 * GET /api/admin/agents
 * Fetch all agents with ticket counts
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.department,
        u.role,
        u.status,
        COALESCE(t.ticket_count, 0) AS ticket_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY user_id
      ) t ON t.user_id = u.id
      WHERE u.role = 'agent'
      ORDER BY u.id ASC;
    `);

    res.status(200).json(result.rows);
  } catch (err: any) {
    console.error("❌ Error fetching agents:", err.message);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

/**
 * PUT /api/admin/agents/:id
 * Update agent details
 */
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, department } = req.body;

  try {
    const result = await db.query(
      "UPDATE users SET name = $1, email = $2, department = $3 WHERE id = $4 AND role = 'agent' RETURNING *",
      [name, email, department, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Agent not found" });

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error("❌ Error updating agent:", err.message);
    res.status(500).json({ error: "Failed to update agent" });
  }
});

/**
 * DELETE /api/admin/agents/:id
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing agent ID" });

    const deleteResult = await db.query(
      `DELETE FROM users
       WHERE id = $1 AND role = 'agent'
       RETURNING *`,
      [id]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const allAgents = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.department,
        u.role,
        u.status,
        COALESCE(t.ticket_count, 0) AS ticket_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY user_id
      ) t ON t.user_id = u.id
      WHERE u.role = 'agent'
      ORDER BY u.id ASC;
    `);

    res.status(200).json(allAgents.rows);
  } catch (err: any) {
    console.error("❌ Error deleting agent:", err.message);
    res.status(500).json({ error: "Failed to delete agent" });
  }
});

/**
 * PUT /api/admin/agents/toggle/:id
 * Toggle agent status (active/inactive)
 */
router.put("/toggle/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid agent id" });
  }

  try {
    // get current status
    const current = await db.query("SELECT status FROM users WHERE id = $1 AND role = 'agent'", [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const currentStatus = current.rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update only status
    const updated = await db.query(
      "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status",
      [newStatus, id]
    );

    return res.status(200).json(updated.rows[0]); // only { id, status }
  } catch (err: any) {
    console.error("❌ Toggle status error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
