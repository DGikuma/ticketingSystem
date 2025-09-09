import type { Request, Response } from "express";
import { db } from "../../../db"; // adjust path as needed

export default async function handler(req: Request, res: Response) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
        SELECT assigned_to, COUNT(*) AS ticket_count
        FROM tickets
        GROUP BY assigned_to
      ) t ON t.assigned_to = u.id
      WHERE u.role = 'agent'
      ORDER BY u.id ASC;
    `);

    return res.status(200).json(result.rows);
  } catch (err: any) {
    console.error("❌ Error fetching agents:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
