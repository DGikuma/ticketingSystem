import { Request, Response } from "express";
import { db } from "../../db";

export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const escalated = req.query.escalated === 'true';

    const query = escalated
      ? "SELECT * FROM tickets WHERE needs_escalation = true"
      : "SELECT * FROM tickets";

    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tickets", error });
  }
};
