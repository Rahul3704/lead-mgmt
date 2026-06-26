const nodemailer = require("nodemailer");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const REAL_LINK = process.env.REAL_LINK || "https://www.anthropic.com";

function buildTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT) || 587;

    return nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: true,
  debug: true,
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});
  }

  throw new Error("SMTP_USER and SMTP_PASS are required to send email.");
}

function buildHtml({ name, requirement, leadId }) {
  // 1x1 transparent tracking pixel -> hits /track/open/:id when email is rendered
  const pixelUrl = `${BASE_URL}/track/open/${leadId}`;
  // Trackable link -> records click then 302-redirects to the real destination
  const trackedLink = `${BASE_URL}/track/click/${leadId}`;

  return `
  <div style="font-family: Arial, sans-serif; color:#1f2937; line-height:1.6; max-width:560px;">
    <p>Hi ${name},</p>
    <p>Thank you for reaching out.</p>
    <p>We received your requirement: <strong>"${requirement}"</strong></p>
    <p>
      <a href="${trackedLink}"
         style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;
                padding:10px 18px;border-radius:6px;font-weight:bold;">
        Learn more
      </a>
    </p>
    <p>Regards,<br/>Team</p>
    <img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />
  </div>`;
}

async function sendLeadEmail(lead) {
  const transporter = buildTransporter();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: lead.email,
    subject: "Thanks for reaching out!",
    html: buildHtml({ name: lead.name, requirement: lead.requirement, leadId: lead._id }),
  });
  return info;
}

module.exports = { sendLeadEmail, REAL_LINK,buildTransporter};
