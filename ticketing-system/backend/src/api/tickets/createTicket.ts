import { Request, Response } from "express";
import { db } from "../../db";

export const createTicket = async (req: Request, res: Response) => {
  const user = req.user; // populated by verifyToken middleware

  if (!user || !user.email) {
    return res.status(401).json({ message: "Unauthorized: missing user data" });
  }

  const {
    subject,
    description,
    priority,
    status = "open",
    department_id,
    assigned_to,
  } = req.body;

  const created_by = user.email; 
  const attachment_url = req.file?.path || null;

  try {
    await db.query(
      `INSERT INTO tickets
      (subject, description, priority, status, created_by, department_id, assigned_to, attachment_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        subject,
        description,
        priority,
        status,
        created_by,
        department_id || null,
        assigned_to || null,
        attachment_url,
      ]
    );

    res.status(201).json({ message: "Ticket created successfully" });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Error creating ticket", error });
  }
};
