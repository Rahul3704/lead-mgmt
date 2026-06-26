const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  // ---- User-submitted data ----
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  company: { type: String, trim: true, default: "" },
  requirement: { type: String, required: true, trim: true },
  submissionTime: { type: Date, default: Date.now },

  // ---- AI classification (bonus) ----
  aiCategory: { type: String, default: "Uncategorized" },
  aiPriority: { type: String, default: "Medium" },

  // ---- Email tracking ----
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date, default: null },

  emailOpened: { type: Boolean, default: false },
  emailOpenedAt: { type: Date, default: null },
  openCount: { type: Number, default: 0 },

  linkClicked: { type: Boolean, default: false },
  linkClickedAt: { type: Date, default: null },
  clickCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Lead", leadSchema);
