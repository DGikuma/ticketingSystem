import { Request, Response } from "express";
import { db } from "../../db";

export const assignTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { assigned_to } = req.body;
    await db.query("UPDATE tickets SET assigned_to = ? WHERE id = ?", [assigned_to, ticketId]);
    res.json({ message: "Ticket assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Assignment failed", error });
  }
};