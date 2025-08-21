import { Request, Response } from "express";
import { UsersService } from "./users.service";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// CREATE
export async function createUser(req: Request, res: Response) {
  try {
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;
    const user = await UsersService.createUser({ ...req.body, avatar });
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

// READ ALL
export async function getUsers(_req: Request, res: Response) {
  try {
    const users = await UsersService.getAllUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

// READ ONE
export async function getUserById(req: Request, res: Response) {
  try {
    const user = await UsersService.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

// UPDATE
export async function updateUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const oldUser = await UsersService.getUserById(id);
    if (!oldUser) return res.status(404).json({ message: "User not found" });

    let avatar = oldUser.avatar;
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
      if (oldUser.avatar) {
        const oldPath = path.join(UPLOADS_DIR, path.basename(oldUser.avatar));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const user = await UsersService.updateUser(id, { ...req.body, avatar });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

// DELETE
export async function deleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const deleted = await UsersService.deleteUser(id);

    if (deleted?.avatar) {
      const filePath = path.join(UPLOADS_DIR, path.basename(deleted.avatar));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: "User deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
