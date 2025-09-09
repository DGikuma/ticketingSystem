import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

// Load environment variables
dotenv.config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "Loaded ✅" : "❌ MISSING");

// Import Routes
import authRoutes from "./routes/authRoutes";
import resetRoutes from "./routes/resetRoutes";
import userRoutes from "./routes/userRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import getUserTickets from "./routes/userTickets";
import notificationRoutes from "./routes/notificationsRoutes";
import agentsRoutes from "./routes/agentsRoutes";
import ticketsRoutes from "./routes/ticketsRoutes";
import { authMiddleware } from "./middleware/authMiddleware";
import adminUsers from "./routes/adminUsers";
import adminAgents from "./routes/adminAgents";
import { getTickets } from "./api/tickets/ticket";

// Init mailer
import "./utils/mailer";

// DB connection
import { db } from "./db";
db.connect()
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  });

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// ✅ Create server instance
const server = http.createServer(app);

// ✅ Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🧩 New client connected:", socket.id);

  socket.emit("server-message", "Welcome to Socket.IO!");

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/reset", resetRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/user-tickets", getUserTickets);
app.use("/api/notifications", notificationRoutes);
app.use("/api/agents", agentsRoutes);
app.use("/api/admin/users", authMiddleware, adminUsers);
app.use("/api/admin/agents", /*authMiddleware,*/ adminAgents);
app.get("/api/tickets", getTickets);

// ✅ Route logging
console.log("\n✅ Loaded Routes:");
console.table([
  { Path: "/api/auth", Route: "authRoutes" },
  { Path: "/api/tickets", Route: "ticketsRoutes" },
  { Path: "/api/reset", Route: "resetRoutes" },
  { Path: "/api/users", Route: "userRoutes" },
  { Path: "/api/upload", Route: "uploadRoutes" },
  { Path: "/api/user-tickets", Route: "getUserTickets" },
  { Path: "/api/notifications", Route: "notificationRoutes" },
  { Path: "/api/agents", Route: "agentsRoutes" },
  { Path: "/api/admin/users", Route: "adminUsers" },
  { Path: "/api/admin/agents", Route: "adminAgents" },
]);

// Root Route
app.get("/", (req, res) => {
  res.send("✅ Backend server is running");
});

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "🔍 Route not found" });
});

// ✅ Start Server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`🔗 Socket.IO running on same server`);
});
