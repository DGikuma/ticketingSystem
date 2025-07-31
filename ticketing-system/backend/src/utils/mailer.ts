import dotenv from 'dotenv';
dotenv.config();

import nodemailer from "nodemailer";

console.log("MAILER ENV USER:", process.env.EMAIL_USER);
console.log("MAILER ENV PASS:", process.env.EMAIL_PASSWORD ? "✅ Loaded" : "❌ MISSING");

export const transporter = nodemailer.createTransport({
  host: "mail5016.site4now.net",
  port: 465,
  secure: true,
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const mailOptions = {
  from: `"Helpdesk Support" <${process.env.EMAIL_USER}>`,
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
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
};



