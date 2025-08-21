import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../../db";

// Debug logger
const log = (...args: any[]) => console.log("[resetPassword]", ...args);

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    log("Incoming resetPassword request with token:", token);

    // 🔍 Debug: decode a base64 string (replace with the one from Nodemailer logs)
    const encoded = "dXNlcm5hbWVAZG9tYWluLmNvbQ==";
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    console.log("[resetPassword] Decoded base64:", decoded);

    // 1. Check token in DB
    const tokenResult = await db.query(
      "SELECT * FROM password_resets WHERE token = $1 LIMIT 1",
      [token]
    );
    const resetRecord = tokenResult.rows[0];

    if (!resetRecord) {
      log("Invalid or expired reset token (not found in DB).");
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // 2. Check expiration
    if (new Date(resetRecord.expires_at) < new Date()) {
      log("Reset token expired for userId:", resetRecord.user_id);
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // 3. Verify JWT signature (extra safety)
    try {
      jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      log("JWT verification failed:", err);
      return res.status(400).json({ message: "Invalid reset token" });
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update user password
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      resetRecord.user_id,
    ]);
    log("Password updated for userId:", resetRecord.user_id);

    // 6. Delete all outstanding reset tokens for this user (more secure)
    await db.query("DELETE FROM password_resets WHERE user_id = $1", [
      resetRecord.user_id,
    ]);
    log("All reset tokens deleted for userId:", resetRecord.user_id);

    res.json({ message: "Password reset successful" });
  } catch (err: any) {
    log("Error in resetPassword:", err);
    res.status(500).json({
      message: "Error resetting password",
      error: err.message,
    });
  }
};
