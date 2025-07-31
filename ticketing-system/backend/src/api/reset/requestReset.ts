import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../../db";
import { transporter, mailOptions } from "../../utils/mailer";

export const requestReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "No user with that email exists" });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.RESET_TOKEN_SECRET as string,
      { expiresIn: process.env.RESET_TOKEN_EXPIRY || '15m' } as jwt.SignOptions
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailConfig = {
      ...mailOptions,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hello <strong>${user.name || "User"}</strong>,</p>
          <p>You requested a password reset. Click the link below to reset it:</p>
          <p><a href="${resetLink}" style="color: #007bff;">Reset Password</a></p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <br/>
          <p>Thanks, <br/> Helpdesk Support Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailConfig);

    return res.status(200).json({ message: "Password reset link sent!" });
  } catch (err) {
    console.error("Error in requestReset:", err);
    return res.status(500).json({ message: "Failed to send reset link." });
  }
};
