
import { Router } from "express";
import multer from "multer";
import path from "path";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../api/admin/users/users.controller";

const router = Router();

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("avatar"), createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", upload.single("avatar"), updateUser);
router.delete("/:id", deleteUser);

export default router;
