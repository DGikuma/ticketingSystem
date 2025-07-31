import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../../db";

export const register = async (req: Request, res: Response) => {
  const { fullname, username, password, email } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (fullname, username, password, email) VALUES (?, ?, ?, ?)",
      [fullname, username, hashedPassword, email]
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration error", error });
  }
};
