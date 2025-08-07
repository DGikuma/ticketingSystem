import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

// Log environment values for debugging
console.log("SMTP Host:", process.env.EMAIL_HOST);
console.log("SMTP User:", process.env.EMAIL_USER);
console.log("SMTP Password:", process.env.EMAIL_PASSWORD ? "✅ Present" : "❌ MISSING");

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // ✅ for testing or self-signed certs
  },
});

export const mailOptions = {
  from: process.env.EMAIL_FROM || `"Support" <${process.env.EMAIL_USER}>`,
};

export const sendMail = async (to: string, subject: string, text: string) => {
  try {
    await transporter.sendMail({
      ...mailOptions,
      to,
      subject,
      text,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${to}:`, error.message || error);
  }
};
