import { Request, Response } from "express";
import { db } from "../../../db";

export const editComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    await db.query("UPDATE comments SET message = ? WHERE id = ?", [message, id]);
    res.json({ message: "Comment edited" });
  } catch (error) {
    res.status(500).json({ message: "Failed to edit comment", error });
  }
};