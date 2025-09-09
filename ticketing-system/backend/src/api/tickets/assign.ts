// tickets/assignTicket.ts
import { Request, Response } from "express";
import { db } from "../../db";

export const assign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ticket ID
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ message: "agentId is required" });
    }

    // ✅ Ensure ticket exists
    const ticketRes = await db.query("SELECT id FROM tickets WHERE id = $1", [id]);
    if (ticketRes.rowCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ✅ Ensure agent exists and is an agent
    const agentRes = await db.query(
      "SELECT id, name FROM users WHERE id = $1 AND role = 'agent'",
      [agentId]
    );
    if (agentRes.rowCount === 0) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // ✅ Assign ticket
    await db.query("UPDATE tickets SET assigned_to = $1 WHERE id = $2", [agentId, id]);

    // ✅ Return assigned agent name for frontend
    res.json({ assigned_to_name: agentRes.rows[0].name });
  } catch (error) {
    console.error("❌ Error assigning ticket:", error);
    res.status(500).json({ message: "Failed to assign ticket" });
  }
};
