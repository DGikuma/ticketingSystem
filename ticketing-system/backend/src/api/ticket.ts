import { Request, Response } from "express";
import { db } from "../db";

export const getTickets = async (req: Request, res: Response) => {
  try {
    // 🔍 Debug: check DB connection
    const debug = await db.query("SELECT COUNT(*) AS cnt FROM tickets");
    console.log("🛠 Tickets in DB (raw count):", debug.rows[0].cnt);

    const { status, page = "1", limit = "10", search = "" } = req.query;

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit as string, 10) || 10, 1);
    const offset = (pageNum - 1) * limitNum;

    // Map frontend statuses to DB
    const statusMap: Record<string, string> = {
      Open: "open",
      Pending: "in_progress",
      Closed: "closed",
    };

    let baseQuery = `
      FROM tickets t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let index = 1;

    // ✅ Filter by status
    if (status) {
      const dbStatus = statusMap[status as string] || status;
      baseQuery += ` AND t.status = $${index++}`;
      values.push(dbStatus);
    }

    // ✅ Filter by search (subject OR description ILIKE)
    if (search && typeof search === "string" && search.trim() !== "") {
      baseQuery += ` AND (t.subject ILIKE $${index} OR t.description ILIKE $${index})`;
      values.push(`%${search.trim()}%`);
      index++;
    }

    // Tickets query
    const ticketsQuery = `
      SELECT
        t.*,
        CASE
          WHEN t.status = 'open' THEN 'Open'
          WHEN t.status = 'in_progress' THEN 'Pending'
          WHEN t.status = 'closed' THEN 'Closed'
          ELSE t.status
        END AS status,
        u.name AS assigned_to_name
      ${baseQuery}
      ORDER BY t.id DESC
      LIMIT $${index++} OFFSET $${index++}
    `;
    values.push(limitNum, offset);

    // Count query (use same filters but without LIMIT/OFFSET)
    const countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;
    const countValues = values.slice(0, values.length - 2);

    console.log("📡 Tickets query:", ticketsQuery);
    console.log("📦 Values:", values);

    const [ticketsResult, countResult] = await Promise.all([
      db.query(ticketsQuery, values),
      db.query(countQuery, countValues),
    ]);

    const rows = ticketsResult.rows;
    const total = parseInt(countResult.rows[0]?.total || "0", 10);

    console.log("📥 Tickets result:", rows);
    console.log("📊 Tickets total:", total);

    res.json({ tickets: rows, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("❌ Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};
