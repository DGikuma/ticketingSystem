import { Request, Response } from "express";
import {
  createUser as serviceCreateUser,
  getAllUsers,
  getUserById as serviceGetUserById,
  updateUser as serviceUpdateUser,
  deleteUser as serviceDeleteUser,
} from "./users.service";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// CREATE
export async function createUser(req: Request, res: Response) {
  try {
    console.log("📥 createUser hit. Body:", req.body, "File:", req.file?.filename);
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;
    const user = await serviceCreateUser({ ...req.body, avatar });
    console.log("✅ User created:", user);
    res.status(201).json(user);
  } catch (err: any) {
    console.error("❌ createUser error:", err.message);
    res.status(400).json({ message: err.message });
  }
}

// READ ALL
export async function getUsers(_req: Request, res: Response) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

// READ ONE
export async function getUserById(req: Request, res: Response) {
  try {
    const user = await serviceGetUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

// UPDATE
export async function updateUser(req: Request, res: Response) {
  try {
    console.log("📥 updateUser hit. Params:", req.params, "Body:", req.body, "File:", req.file?.filename);
    const id = Number(req.params.id);
    const oldUser = await serviceGetUserById(id);
    if (!oldUser) {
      console.warn("⚠️ updateUser: User not found", id);
      return res.status(404).json({ message: "User not found" });
    }

    let avatar = (oldUser as any).avatar;
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
      console.log("🖼️ New avatar uploaded:", avatar);
    }

    const user = await serviceUpdateUser(id, { ...req.body, avatar });
    console.log("✅ User updated:", user);
    res.json(user);
  } catch (err: any) {
    console.error("❌ updateUser error:", err.message);
    res.status(400).json({ message: err.message });
  }
}

// DELETE
export async function deleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const deleted = await serviceDeleteUser(id);

    if (deleted && (deleted as any).avatar) {
      const filePath = path.join(UPLOADS_DIR, path.basename((deleted as any).avatar));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: "User deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
