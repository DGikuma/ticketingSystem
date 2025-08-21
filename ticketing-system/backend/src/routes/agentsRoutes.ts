import { Router, Request, Response } from "express";
import { db } from "../db";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * GET /api/agents
 * Fetch all users with role = agent
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      "SELECT id, name FROM users WHERE role = 'agent' ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching agents:", err);
    res.status(500).json({ message: "Failed to fetch agents" });
  }
});

export default router;
