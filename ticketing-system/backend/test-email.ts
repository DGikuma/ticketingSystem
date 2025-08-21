import nodemailer from "nodemailer";

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: "mail5016.site4now.net",
    port: 465, // try 587 if 465 fails
    secure: true, // true for 465, false for 587
    auth: {
      user: "ict@birdviewinsurance.com",
      pass: "B!rdv!ew@2024",
    },
    tls: {
      rejectUnauthorized: false, // allow self-signed certs
    },
  });

  // Verify SMTP connection
  transporter.verify((err, success) => {
    if (err) {
      console.error("❌ SMTP Connection Failed:", err);
    } else {
      console.log("✅ SMTP ready to send emails:", success);
    }
  });

  // Optional: send a test email
  try {
    const info = await transporter.sendMail({
      from: '"HelpDesk Support" <ict@birdviewinsurance.com>',
      to: "your-email@example.com", // 👈 replace with your own address
      subject: "SMTP Test (Nodemailer + TypeScript)",
      text: "Hello 👋, this is a test email from Nodemailer in TypeScript!",
    });

    console.log("✅ Test email sent:", info.messageId);
  } catch (error: any) {
    console.error("❌ Failed to send test email:", error.message || error);
  }
}

testEmail();
