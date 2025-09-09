import { Request, Response } from "express";
import { db } from "../../db"; 

export const getTickets = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // ✅ Final query with proper assigned_to_name
    const ticketsQuery = `
      SELECT
          t.id,
          t.user_id,
          t.assigned_to,
          COALESCE(NULLIF(u.name, ''), u.email, 'Unassigned') AS assigned_to_name,
          t.subject,
          t.description,
          t.file,
          CASE
              WHEN t.status = 'open' THEN 'Open'
              WHEN t.status = 'in_progress' THEN 'Pending'
              WHEN t.status = 'closed' THEN 'Closed'
              ELSE INITCAP(t.status)
          END AS status,
          t.priority,
          t.needs_escalation,
          t.created_at,
          t.updated_at,
          t.file_url,
          t.created_by,
          t.department_id,
          t.attachment_url
      FROM tickets t
      LEFT JOIN users u ON t.assigned_to = u.id
      ORDER BY t.id DESC
      LIMIT $1 OFFSET $2
    `;

    const ticketsResult = await db.query(ticketsQuery, [limitNum, offset]);

    // ✅ Total for pagination
    const totalResult = await db.query("SELECT COUNT(*) FROM tickets");
    const total = parseInt(totalResult.rows[0].count, 10);

    res.json({
      tickets: ticketsResult.rows,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    console.error("❌ Error fetching tickets:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
