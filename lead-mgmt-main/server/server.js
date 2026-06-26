require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Lead = require("./models/Lead");
const { classifyLead } = require("./utils/aiClassifier");
const { sendLeadEmail, REAL_LINK,buildTransporter } = require("./utils/emailService");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1x1 transparent GIF for the open-tracking pixel
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

// ---------- DB ----------
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lead_system";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// ---------- 1. Lead capture + auto email ----------
app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, phone, company, requirement } = req.body;
    if (!name || !email || !phone || !requirement) {
      return res.status(400).json({ error: "Name, email, phone and requirement are required." });
    }

    // Bonus: AI classification
    const { category, priority } = classifyLead(requirement);

    const lead = await Lead.create({
      name, email, phone,
      company: company || "",
      requirement,
      aiCategory: category,
      aiPriority: priority,
    });

    let emailError = null;

    try {
      await sendLeadEmail(lead);
      lead.emailSent = true;
      lead.emailSentAt = new Date();
      await lead.save();
    } catch (mailErr) {
      emailError = mailErr.message;
      console.error("Email send failed:", mailErr.message);
    }

    res.status(201).json({
      message: lead.emailSent ? "Lead saved & email sent" : "Lead saved, but email was not sent",
      emailSent: lead.emailSent,
      emailError,
      lead,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- 2. Open tracking (pixel) ----------
app.get("/track/open/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (lead) {
      lead.openCount += 1;
      if (!lead.emailOpened) {
        lead.emailOpened = true;
        lead.emailOpenedAt = new Date();
      }
      await lead.save();
    }
  } catch (e) {
    /* swallow — never break image load */
  }
  res.set("Content-Type", "image/gif");
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.send(PIXEL);
});

// ---------- 3. Click tracking + redirect ----------
app.get("/track/click/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (lead) {
      lead.clickCount += 1;
      if (!lead.linkClicked) {
        lead.linkClicked = true;
        lead.linkClickedAt = new Date();
      }
      await lead.save();
    }
  } catch (e) {
    /* swallow */
  }
  res.redirect(REAL_LINK);
});

// ---------- 4. Dashboard analytics ----------
app.get("/api/stats", async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const emailsSent = await Lead.countDocuments({ emailSent: true });
    const emailsOpened = await Lead.countDocuments({ emailOpened: true });
    const linksClicked = await Lead.countDocuments({ linkClicked: true });

    const openRate = emailsSent ? Math.round((emailsOpened / emailsSent) * 100) : 0;
    const clickRate = emailsSent ? Math.round((linksClicked / emailsSent) * 100) : 0;

    res.json({ totalLeads, emailsSent, emailsOpened, openRate, linksClicked, clickRate });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- 5. List leads (for dashboard table) ----------
app.get("/api/leads", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ submissionTime: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/test-email", async (req, res) => {
  try {
    const transporter = buildTransporter();
    await transporter.verify();
    res.send("SMTP Connected");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
const net = require("net");

app.get("/test-smtp-port", (req, res) => {
  const socket = net.createConnection(587, "smtp.gmail.com");

  socket.setTimeout(10000);

  socket.on("connect", () => {
    socket.destroy();
    res.send("TCP connection successful");
  });

  socket.on("timeout", () => {
    socket.destroy();
    res.status(500).send("TCP timeout");
  });

  socket.on("error", (err) => {
    res.status(500).send(err.code || err.message);
  });
});
app.get("/", (req, res) => res.send("Lead Management API running"));

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
