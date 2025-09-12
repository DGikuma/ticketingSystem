import { Request, Response } from "express";
import { db } from "../../../db";

// ✅ GET /api/admin/dashboard/kpis
export const getKpis = async (req: Request, res: Response) => {
  try {
    // 1. Total tickets
    const totalResult = await db.query(`SELECT COUNT(*) AS total FROM tickets`);
    const totalTickets = parseInt(totalResult.rows[0].total, 10) || 0;

    // 2. Active tickets (everything not closed)
    const activeResult = await db.query(
      `SELECT COUNT(*) AS active FROM tickets WHERE status != 'closed'`
    );
    const activeTickets = parseInt(activeResult.rows[0].active, 10) || 0;

    // 3. Closed tickets
    const closedResult = await db.query(
      `SELECT COUNT(*) AS closed FROM tickets WHERE status = 'closed'`
    );
    const closedTickets = parseInt(closedResult.rows[0].closed, 10) || 0;

    // 4. Average resolution time (hours) for closed tickets
    // Assumes you have created_at + updated_at columns in tickets table
    const resolutionResult = await db.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) AS avg_hours
       FROM tickets
       WHERE status = 'closed'`
    );
    const avgResolutionTime = parseFloat(resolutionResult.rows[0].avg_hours) || 0;

    res.json({
      totalTickets,
      activeTickets,
      closedTickets,
      avgResolutionTime: Number(avgResolutionTime.toFixed(2)), // keep 2 decimals
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    res.status(500).json({ message: "Failed to fetch KPIs" });
  }
};
