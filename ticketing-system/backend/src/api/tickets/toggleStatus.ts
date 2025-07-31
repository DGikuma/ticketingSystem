import { Request, Response } from "express";
import { db } from "../../db";

export const toggleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE tickets SET status = CASE WHEN status = 'open' THEN 'closed' ELSE 'open' END WHERE id = ?", [id]);
    res.json({ message: "Status toggled" });
  } catch (error) {
    res.status(500).json({ message: "Status toggle failed", error });
  }
};