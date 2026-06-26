# ⚡ LeadFlow — Automated Lead Management & Email Tracking System

A full-stack system where users submit a form, data is stored in MongoDB, a
personalized email is sent automatically, and email **opens** + link **clicks**
are tracked on a live analytics dashboard.

**Stack:** React (frontend) · Node.js + Express (backend) · MongoDB + Mongoose (database) · Nodemailer (email)

---

## Features

| # | Feature | Where |
|---|---------|-------|
| 1 | Lead capture form (name, email, phone, company, requirement) | `client/src/components/LeadForm.js` |
| 2 | MongoDB storage of user-submitted data | `server/models/Lead.js` |
| 3 | Auto personalized email (dynamic name + requirement, trackable link) | `server/utils/emailService.js` |
| 4 | Email **open** tracking (invisible pixel) | `GET /track/open/:id` |
| 5 | Link **click** tracking + redirect | `GET /track/click/:id` |
| 6 | Analytics dashboard (leads, sent, opened, open %, clicked, click %) | `client/src/components/Dashboard.js` |
| 7 | **Bonus:** AI lead classification (category + priority) | `server/utils/aiClassifier.js` |

---

## Quick Start

### 1. Backend
```bash
cd server
npm install
cp .env.example .env      # then fill in MONGO_URI and (optionally) SMTP creds
npm start                 # http://localhost:5000
```
> If you leave SMTP creds blank, emails are logged to the console instead of
> actually sent — the rest of the flow (DB, tracking, dashboard) still works.

### 2. Frontend
```bash
cd client
npm install
npm start                 # http://localhost:3000
```
The client proxies API calls to `localhost:5000` (set in `client/package.json`).

### MongoDB
Use a local `mongod` instance or a free **MongoDB Atlas** cluster, and put the
connection string in `server/.env` as `MONGO_URI`.

---

## Architecture

```
 Browser (React)
   │  POST /api/leads  ─────────────►  Express API ──► MongoDB (Lead doc)
   │                                        │
   │                                        └──► Nodemailer sends email
   │                                              with pixel + tracked link
   ▼
 Recipient's inbox
   │  opens email  ──► GET /track/open/:id   ──► openCount++, emailOpened=true
   │  clicks link  ──► GET /track/click/:id  ──► clickCount++, 302 → real URL
   ▼
 Dashboard (React)  ──► GET /api/stats + /api/leads  (auto-refresh every 5s)
```

---

## How Tracking Works

**Open tracking** — every email embeds a 1×1 invisible image:
`<img src="…/track/open/<leadId>">`. When the recipient's mail client renders
the email, it requests that URL. The server records the open and returns a
transparent GIF.

**Click tracking** — the "Learn more" button points at
`…/track/click/<leadId>` instead of the real destination. The server logs the
click, then `302`-redirects the user to the actual link (`REAL_LINK` in `.env`).
The user reaches the destination seamlessly while the click is recorded.

**Stats** — `/api/stats` computes counts and rates directly from the stored
flags: `openRate = opened / sent`, `clickRate = clicked / sent`.

---

## AI Bonus

`aiClassifier.js` analyzes the requirement text and assigns a **category**
(AI Automation, Web Development, Mobile, Data & Analytics, etc.) and a
**priority** (High/Medium/Low) based on intent and urgency keywords. It runs
locally with no API key so the demo is always reproducible; swap in an LLM call
if desired.

---

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/leads` | Create lead, classify, send email |
| GET  | `/api/leads` | List all leads |
| GET  | `/api/stats` | Dashboard aggregates |
| GET  | `/track/open/:id` | Open pixel |
| GET  | `/track/click/:id` | Click + redirect |
