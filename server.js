require("dotenv").config({ path: "./.env" });

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// 🛡️ --- CONCURRENCY CONTROL SYSTEM --- 🛡️
const activeUsers = new Map(); // Store: IP -> lastActivityTime
const USER_LIMIT = 30;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes inactivity timeout

// Middleware to track and limit concurrent users
const concurrencyMiddleware = (req, res, next) => {
  const userIp = req.headers['x-forwarded-for'] || req.ip;
  const now = Date.now();

  // If user is already active, just update their timestamp
  if (activeUsers.has(userIp)) {
    activeUsers.set(userIp, now);
    return next();
  }

  // If new user, check if we have space
  if (activeUsers.size < USER_LIMIT) {
    activeUsers.set(userIp, now);
    console.log(`👤 New active user: ${userIp} | Total: ${activeUsers.size}`);
    return next();
  }

  // If no space, reject request
  console.warn(`🕒 Server at capacity (${USER_LIMIT} users). Rejecting: ${userIp}`);
  res.status(503).json({
    message: "Server is busy, please try again later.",
    activeUsers: activeUsers.size
  });
};

// Apply to all routes
app.use(concurrencyMiddleware);

// Automatic Cleanup Task: Prune inactive users every 60 seconds
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [ip, lastActivity] of activeUsers.entries()) {
    if (now - lastActivity > INACTIVITY_TIMEOUT) {
      activeUsers.delete(ip);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} inactive users. Current active: ${activeUsers.size}`);
  }
}, 60000);

// Admin Monitoring Route
app.get("/admin/monitor", (req, res) => {
  res.json({
    status: "Live",
    activeUsersCount: activeUsers.size,
    limit: USER_LIMIT,
    timeoutMinutes: INACTIVITY_TIMEOUT / 60000,
    activeIps: Array.from(activeUsers.keys())
  });
});
// 🛡️ --- END CONCURRENCY SYSTEM --- 🛡️

// ✅ Mail transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP ERROR 👉", error);
  } else {
    console.log("✅ SMTP READY - Ready to send emails");
  }
});

// ✅ Route: Send emails after registration
app.post("/register", async (req, res) => {
  const { name, email, phone, service, message } = req.body;

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
      <p>We're thrilled to have you on board and we truly appreciate you choosing us.</p>

      <p>At JEKOKU HATS, we are committed to delivering smart, reliable and innovative solutions — and your trust means everything to us.</p>

      <h3>Here's what happens next:</h3>
      <p>One of our team members will personally reach out to you within 24 hours to understand your needs and guide you through the next steps.</p>

      <p>In the meantime, feel free to explore our services:</p>

      <ul>
        <li>🌐 Web Design & Development</li>
        <li>🤖 Custom AI Solutions</li>
        <li>🧪 Software Testing</li>
        <li>🎓 Webinars & Training</li>
        <li>🎨 Posters, Pamphlets & Design</li>
      </ul>

      <h3>Have a question right away?</h3>
      <p>
        📧 jekokuhats@gmail.com<br/>
        📱 +91 9342589233 / +91 8122469078<br/>
        🌐 www.jekokuhats.com
      </p>

      <p>We look forward to being a part of your journey.</p>

      <br/>
      <p>
        Warm regards,<br/>
        <b>JEKOKU HATS</b><br/>
        <i>Born Friends. Built Empire. 👑</i>
      </p>
    </div>
  `
    };

    const adminMailOptions = {
      from: `"JEKOKU HATS" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🔔 New Client Registration — Action Required!",
      html: `
    <div style="font-family:Arial; padding:20px; line-height:1.6; color: #333;">
      
      <h2 style="color: #e11d48;">Hey Team,</h2>

      <p>A new user has just registered on the <b>JEKOKU HATS</b> website! 🎉</p>

      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
        <h3 style="margin-top: 0;">👤 CLIENT DETAILS</h3>
        <p>
          <b>Name:</b> ${name}<br/>
          <b>Email:</b> ${email}<br/>
          <b>Phone:</b> ${phone}<br/>
          <b>Registered On:</b> ${new Date().toLocaleString()}<br/>
          <b>Service Interested In:</b> ${service || "Not specified"}<br/>
          <b>Message:</b> ${message || "No message provided"}
        </p>
      </div>

      <h3>⚡ ACTION REQUIRED:</h3>
      <ul>
        <li>Call the client within 24 hours</li>
        <li>Understand their requirement</li>
        <li>Send a follow up proposal if needed</li>
        <li>Update the lead tracker sheet</li>
      </ul>

      <h3>📌 PRIORITY LEVEL</h3>
      <p>🟢 <b style="color: #059669;">New Lead — Contact ASAP!</b></p>

      <br/>
      <p style="font-size: 0.9rem; color: #666;">This is an automated notification from the JEKOKU HATS website.</p>

      <p>
        <b>JEKOKU HATS Internal System</b><br/>
        <i>Born Friends. Built Empire. 👑</i>
      </p>

    </div>
  `
    };

    // Send both emails in parallel
    const results = await Promise.allSettled([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);

    const userMailSent = results[0].status === 'fulfilled';
    const adminMailSent = results[1].status === 'fulfilled';

    if (userMailSent && adminMailSent) {
      console.log(`✅ Both emails sent successfully for ${name}`);
      res.send("Registration successful 🎉 All notifications sent!");
    } else {
      console.warn(`⚠️ Partial dispatch: User: ${userMailSent}, Admin: ${adminMailSent}`);
      if (!userMailSent) console.error("❌ User Email Error:", results[0].reason);
      if (!adminMailSent) console.error("❌ Admin Email Error:", results[1].reason);

      res.status(207).send("Registration processed, but some notifications failed ❌");
    }

  } catch (error) {
    console.error("❌ SYSTEM ERROR 👉", error);
    res.status(500).send("Registration failed on server ❌");
  }
});
app.get("/test", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "Test Mail",
      text: "Email working ✅"
    });

    res.send("Mail sent ✅");
  } catch (err) {
    console.error("MAIL ERROR 👉", err);
    res.send("Mail failed ❌");
  }
});

// ✅ Start server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
}

module.exports = app;
