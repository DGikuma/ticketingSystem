import express from 'express';
import { db } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

  // 🔐 LOGIN
  router.post("/login", async (req, res) => {
    console.log("🔐 Login attempt:", req.body.email);
    const { email, password } = req.body;

    try {
      const result = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // 🚫 Block inactive accounts explicitly
      if (user.status === "inactive") {
        return res.status(403).json({ error: "Account is inactive. Contact admin." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log(`❌ Password mismatch for: ${email}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // 🔁 Optional password rehash (fine to keep)
      const newHash = await bcrypt.hash(password, 10);
      if (newHash !== user.password) {
        await db.query("UPDATE users SET password = $1 WHERE id = $2", [
          newHash,
          user.id,
        ]);
        console.log(`🔁 Rehashed password for ${email}`);
      }

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "15m",
      });
      const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET!, {
        expiresIn: "7d",
      });

      await db.query(
        "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
        [user.id, refreshToken]
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        token: accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    } catch (err) {
      console.error("❌ Server error during login:", err);
      res.status(500).json({ error: "Server error during login" });
    }
  });

  // 📝 REGISTER
  router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
      const hashed = await bcrypt.hash(password, 10);

      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // 👇 Insert with status = 'active' by default
      await db.query(
        'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5)',
        [name, email, hashed, role || 'user', 'active']
      );

      res.status(201).json({ message: 'User registered successfully with active status' });
    } catch (err) {
      console.error('❌ Server error during registration:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // 🔁 REFRESH
  router.post("/refresh", async (req, res) => {
    const refresh = req.cookies?.refreshToken;
    if (!refresh) return res.status(401).json({ error: "Missing refresh token" });

    try {
      const payload = jwt.verify(refresh, process.env.REFRESH_SECRET!) as any;

      // Check if token is still valid in DB
      const result = await db.query("SELECT * FROM refresh_tokens WHERE token = $1", [refresh]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      // 🚫 Check if user is still active
      const userResult = await db.query(
        "SELECT id, status, role, email FROM users WHERE id = $1",
        [payload.id]
      );
      const user = userResult.rows[0];
      if (!user || user.status === "inactive") {
        return res.status(403).json({ error: "Account inactive or removed" });
      }

      const newAccess = jwt.sign(
        { id: user.id, email: user.email, role: user.role, status: user.status },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
      );

      res.json({ token: newAccess });
    } catch (err) {
      console.error("❌ Refresh token error:", err);
      res.status(401).json({ error: "Invalid refresh token" });
    }
  });

  // PATCH /api/agents/:id/status
  router.patch("/agents/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      // Update status
      await db.query("UPDATE users SET status = $1 WHERE id = $2", [status, id]);

      if (status === "inactive") {
        // 🔒 Delete all refresh tokens for that user
        await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [id]);
        console.log(`🗑️ Revoked all refresh tokens for user ${id}`);
      }

      res.json({ message: `User status updated to ${status}` });
    } catch (err) {
      console.error("❌ Error updating user status:", err);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

// 🔓 LOGOUT
router.post('/logout', async (req, res) => {
  const refresh = req.cookies?.refreshToken;
  if (refresh) {
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refresh]);
    res.clearCookie('refreshToken');
  }
  res.json({ message: 'Logged out' });
});

export default router;
