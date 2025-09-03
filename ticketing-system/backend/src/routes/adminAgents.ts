import { Router, Request, Response } from "express";
import { db } from "../db"; // adjust path if needed

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
        u.status,  -- ✅ now included
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

// PUT /api/admin/agents/:id
router.put("/:id", async (req, res) => {
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
 * PUT/PATCH /api/admin/agents/:id/status
 * Explicitly set agent status
 */
async function updateAgentStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) return res.status(400).json({ error: "Agent ID required" });
  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const result = await db.query(
      "UPDATE users SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Agent not found" });

    const updatedAgent = await db.query(
      `
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
      WHERE u.id = $1
      GROUP BY u.id, u.name, u.email, u.department, u.role, u.status
      `,
      [id]
    );

    res.status(200).json(updatedAgent.rows[0]);
  } catch (err: any) {
    console.error("❌ Error updating agent status:", err.message);
    res.status(500).json({ error: "Failed to update agent status" });
  }
}

// Register for both PUT and PATCH
router.put("/:id/status", updateAgentStatus);
router.patch("/:id/status", updateAgentStatus);

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

router.put("/toggle/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Agent ID required" });

  try {
    // Get current status
    const agentResult = await db.query("SELECT status FROM users WHERE id = $1", [id]);

    if (agentResult.rowCount === 0) return res.status(404).json({ error: "Agent not found" });

    const currentStatus = agentResult.rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // Update status
    await db.query("UPDATE users SET status = $1 WHERE id = $2", [newStatus, id]);

    // Return updated agent with ticket count
    const updatedAgent = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.department,
        u.role,
        u.status, -- ✅ updated field
        COALESCE(t.ticket_count, 0) AS ticket_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY user_id
      ) t ON t.user_id = u.id
      WHERE u.id = $1
    `, [id]);

    res.status(200).json(updatedAgent.rows[0]);
  } catch (err: any) {
    console.error("❌ Error toggling agent status:", err.message);
    res.status(500).json({ error: "Failed to toggle agent status" });
  }
});


export default router;
