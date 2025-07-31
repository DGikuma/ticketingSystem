import { Request, Response } from "express";
import { db } from "../../../db";

export const fetchComments = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    // ✅ PostgreSQL-compatible query
    const result = await db.query(
      "SELECT * FROM comments WHERE ticket_id = $1 ORDER BY created_at ASC",
      [ticketId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments", error });
  }
};
