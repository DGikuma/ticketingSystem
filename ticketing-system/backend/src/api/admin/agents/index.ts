import type { Request, Response } from "express";

import { db } from "../../../db";

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
        COALESCE(COUNT(t.id), 0) AS ticket_count
      FROM users u
      LEFT JOIN tickets t ON t.user_id = u.id
      WHERE u.role = 'agent'
      GROUP BY u.id, u.name, u.email, u.department, u.role, u.status,
      ORDER BY u.id ASC;
    `);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching agents:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
