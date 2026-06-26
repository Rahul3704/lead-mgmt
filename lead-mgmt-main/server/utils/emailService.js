const axios = require("axios");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const REAL_LINK = process.env.REAL_LINK || "https://www.anthropic.com";

function buildHtml({ name, requirement, leadId }) {
  const pixelUrl = `${BASE_URL}/track/open/${leadId}`;
  const trackedLink = `${BASE_URL}/track/click/${leadId}`;

  return `
  <div style="font-family: Arial, sans-serif; color:#1f2937; line-height:1.6; max-width:560px;">
    <p>Hi ${name},</p>

    <p>Thank you for reaching out.</p>

    <p>We received your requirement:</p>

    <p><strong>${requirement}</strong></p>

    <p>
      <a href="${trackedLink}"
         style="display:inline-block;
                background:#4f46e5;
                color:white;
                padding:12px 20px;
                text-decoration:none;
                border-radius:6px;">
        Learn More
      </a>
    </p>

    <p>Regards,<br/>LeadFlow Team</p>

    <img src="${pixelUrl}" width="1" height="1" style="display:none;" />
  </div>
  `;
}

async function sendLeadEmail(lead) {
  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "LeadFlow",
        email: process.env.MAIL_FROM,
      },

      to: [
        {
          email: lead.email,
          name: lead.name,
        },
      ],

      subject: "Thanks for reaching out!",

      htmlContent: buildHtml({
        name: lead.name,
        requirement: lead.requirement,
        leadId: lead._id,
      }),
    },
    {
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
    }
  );

  return response.data;
}

module.exports = {
  sendLeadEmail,
  REAL_LINK,
};