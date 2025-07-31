import { Request, Response } from "express";
import { db } from "../../db";

export const getAgents = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      "SELECT id, fullname AS name, email FROM users WHERE status = 'agent'"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to get agents", error });
  }
};
