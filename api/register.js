require("dotenv").config({ path: "./.env" });

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// ✅ Mail transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Route: Send emails after registration
// On Vercel, when this file is reached via a rewrite to /api/register, 
// the internal path might just be /register or / depending on the config.
// We'll handle both /register and / to be safe.
app.post(["/register", "/"], async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ MISSING ENVIRONMENT VARIABLES. Please set EMAIL_USER and EMAIL_PASS in Vercel.");
    return res.status(500).send("Server configuration error: missing email credentials.");
  }

  console.log(`📩 Processing registration for: ${name} (${email})`);

  try {
    // Prepare Emails
    const userMailOptions = {
      from: `"JEKOKU HATS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to JEKOKU HATS — We're Glad You're Here!",
      html: `
    <div style="font-family:Arial; padding:20px; line-height:1.6; color: #333;">
      <h2 style="color: #3b82f6;">Dear ${name},</h2>
      <p>Thank you for registering with <b>JEKOKU HATS</b>.</p>
      <p>We're thrilled to have you on board. One of our team members will reach out to you within 24 hours.</p>
      <h3>Our Services:</h3>
      <ul>
        <li>🌐 Web Design & Development</li>
        <li>🤖 Custom AI Solutions</li>
        <li>🧪 Software Testing</li>
      </ul>
      <br/>
      <p>Warm regards,<br/><b>JEKOKU HATS</b></p>
    </div>`
    };

    const adminMailOptions = {
      from: `"JEKOKU HATS" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🔔 New Client Registration — Action Required!",
      html: `
    <div style="font-family:Arial; padding:20px; line-height:1.6; color: #333;">
      <h2 style="color: #e11d48;">Hey Team,</h2>
      <p>A new user has just registered on the <b>JEKOKU HATS</b> website!</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
        <b>Name:</b> ${name}<br/>
        <b>Email:</b> ${email}<br/>
        <b>Phone:</b> ${phone}<br/>
        <b>Service:</b> ${service || "Not specified"}
      </div>
    </div>`
    };

    // Send both emails in parallel
    const results = await Promise.allSettled([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);

    const userMailSent = results[0].status === 'fulfilled';
    const adminMailSent = results[1].status === 'fulfilled';

    if (userMailSent && adminMailSent) {
      res.send("Registration successful! Emails sent.");
    } else {
      console.warn(`⚠️ Partial dispatch: User: ${userMailSent}, Admin: ${adminMailSent}`);
      res.status(207).send("Registration processed, but some notifications failed.");
    }

  } catch (error) {
    console.error("❌ SYSTEM ERROR 👉", error);
    res.status(500).send("Registration failed on server: " + error.message);
  }
});

// ✅ Health check/Test route
app.get("/api/test", async (req, res) => {
  res.json({ status: "alive", timestamp: new Date(), env_check: !!process.env.EMAIL_USER });
});

// ✅ Start server (Only for local testing, NOT used by Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
}

module.exports = app;
