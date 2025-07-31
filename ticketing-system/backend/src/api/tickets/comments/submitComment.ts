import { Request, Response } from "express";
import { db } from "../../../db";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const submitComment = [
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      const { message, parent_id } = req.body;
      const file = req.file?.filename || null;
      const user = req.user as any;

      await db.query(
        "INSERT INTO comments (ticket_id, name, role, message, parent_id, attachment) VALUES (?, ?, ?, ?, ?, ?)",
        [ticketId, user.fullname, user.status, message, parent_id || null, file]
      );
      res.json({ message: "Comment added" });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit comment", error });
    }
  },
];