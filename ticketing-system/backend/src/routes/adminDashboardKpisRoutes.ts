import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getKpis  } from "../api/admin/dashboard/adminDashboardKpisController";

const router = Router();

// All admin dashboard KPI routes are protected
router.use(authMiddleware);

// GET /api/admin/dashboard/kpis
router.get("/kpis", getKpis );

export default router;
