import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getAssignedTickets,
  getTicketById,
  updateTicket,
  addComment,
} from "../api/assigned/assigned_ticket_controller";

const router = Router();

// Debug logger for every request
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    `➡️ [${req.method}] ${req.originalUrl} | Params:`,
    req.params,
    "| Query:",
    req.query
  );
  next();
});

// ✅ Require authentication
router.use(authMiddleware);

// ✅ Fetch all tickets assigned to the logged-in agent
// Final URL: GET /api/assigned
router.get("/", (req, res, ) => {
  console.log("🟢 Endpoint hit: GET /api/assigned");
  return getAssignedTickets(req, res);
});

// ✅ Get a single assigned ticket
// Final URL: GET /api/assigned/:id
router.get("/:id", (req, res ) => {
  console.log("🟢 Endpoint hit: GET /api/assigned/:id");
  return getTicketById(req, res,);
});

// ✅ Update assigned ticket
// Final URL: PUT /api/assigned/:id
router.put("/:id", (req, res) => {
  console.log("🟢 Endpoint hit: PUT /api/assigned/:id");
  return updateTicket(req, res);
});

// ✅ Add comment to assigned ticket
// Final URL: POST /api/assigned/:id/comments
router.post("/:id/comments", (req, res) => {
  console.log("🟢 Endpoint hit: POST /api/assigned/:id/comments");
  return addComment(req, res);
});

// ❌ Catch-all for undefined routes under /api/assigned
router.use((req: Request, res: Response) => {
  console.error("❌ Unknown route:", req.originalUrl);
  res.status(404).json({ error: "🔍 Route not found in /api/assigned" });
});

export default router;
