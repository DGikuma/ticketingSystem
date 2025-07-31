import { Request, Response } from "express";
import { db } from "../../db";

export const createTicket = async (req: Request, res: Response) => {
  const {
    subject,
    description,
    priority,
    status = "open",
    created_by,
    department_id,
    assigned_to,
    attachment_url // if you're handling file uploads
  } = req.body;

  try {
    await db.query(
      `INSERT INTO tickets
      (subject, description, priority, status, created_by, department_id, assigned_to, attachment_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [subject, description, priority, status, created_by, department_id, assigned_to, attachment_url]
    );

    res.status(201).json({ message: "Ticket created successfully" });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Error creating ticket", error });
  }
};
