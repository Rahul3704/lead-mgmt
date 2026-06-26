// Lightweight rule-based lead classifier.
// Works with zero external dependencies / API keys so the demo always runs.
// If you have an OpenAI/Anthropic key, you can swap classifyLead() for an LLM call.

const CATEGORY_RULES = [
  { category: "AI Automation", keywords: ["ai", "automation", "chatbot", "bot", "machine learning", "ml", "gpt", "agent", "automate"] },
  { category: "Web Development", keywords: ["website", "web app", "landing page", "frontend", "react", "ecommerce", "e-commerce", "portal"] },
  { category: "Mobile Development", keywords: ["mobile", "app", "android", "ios", "flutter", "react native"] },
  { category: "Data & Analytics", keywords: ["data", "analytics", "dashboard", "report", "bi", "visualization", "etl"] },
  { category: "Marketing", keywords: ["marketing", "seo", "campaign", "email", "social media", "ads", "lead"] },
  { category: "Cloud & DevOps", keywords: ["cloud", "aws", "azure", "devops", "kubernetes", "docker", "ci/cd", "infrastructure"] },
];

const HIGH_PRIORITY_SIGNALS = ["urgent", "asap", "immediately", "enterprise", "scale", "budget", "production", "critical", "soon"];
const LOW_PRIORITY_SIGNALS = ["just exploring", "curious", "someday", "maybe", "no rush", "research", "learning"];

function classifyLead(requirement = "") {
  const text = requirement.toLowerCase();

  // ---- Category ----
  let category = "General Inquiry";
  let bestScore = 0;
  for (const rule of CATEGORY_RULES) {
    const score = rule.keywords.reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      category = rule.category;
    }
  }

  // ---- Priority ----
  let priority = "Medium";
  if (HIGH_PRIORITY_SIGNALS.some((s) => text.includes(s))) priority = "High";
  else if (LOW_PRIORITY_SIGNALS.some((s) => text.includes(s))) priority = "Low";
  else if (bestScore >= 2) priority = "High"; // strong intent signal

  return { category, priority };
}

module.exports = { classifyLead };
