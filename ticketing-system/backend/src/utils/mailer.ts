import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer"; 

// ===============================
// Load .env from project root
// ===============================
const envPath = path.resolve(__dirname, "../../.env");
console.log("🔍 Looking for .env at:", envPath);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error("❌ Failed to load .env:", result.error);
} else {
  console.log("✅ .env loaded successfully");
}

// ===============================
// Debug loaded environment
// ===============================
console.log("EMAIL_HOST =", process.env.EMAIL_HOST);
console.log("EMAIL_PORT =", process.env.EMAIL_PORT);
console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASSWORD =",
  process.env.EMAIL_PASSWORD ? "✅ Present" : "❌ Missing"
);
console.log("EMAIL_FROM =", process.env.EMAIL_FROM);

// ===============================
// Nodemailer Transporter
// ===============================
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // SSL if port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  authMethod: "LOGIN",
  tls: {
    rejectUnauthorized: false, // ⚠ only for dev/testing
  },
  logger: true, // 🔍 log SMTP traffic
  debug: true, // 🔍 show full debug output
});

// ===============================
// Verify SMTP Connection
// ===============================
transporter.verify((err: Error | null, success: boolean) => {
  if (err) {
    console.error("❌ SMTP Connection Failed:", err);
  } else {
    console.log("✅ SMTP ready to send emails");
  }
});

// ===============================
// Mail Options + Helper
// ===============================
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
