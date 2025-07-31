import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../../db";

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET as string) as {
      id: number;
      email: string;
    };

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      decoded.id,
    ]);

    return res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};
