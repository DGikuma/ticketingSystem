import { Request, Response } from "express";
import { db } from "../../../db";

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM comments WHERE id = ?", [id]);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment", error });
  }
};
