import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API || "";

function Stat({ value, label, accent }) {
  return (
    <div className="stat" style={accent ? { borderTopColor: accent } : {}}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, l] = await Promise.all([
        axios.get(`${API}/api/stats`),
        axios.get(`${API}/api/leads`),
      ]);
      setStats(s.data);
      setLeads(l.data);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // live refresh
    return () => clearInterval(t);
  }, []);

  if (loading) return <p>Loading dashboard…</p>;
  if (!stats) return <p>Could not load stats.</p>;

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <div className="stats-grid">
        <Stat value={stats.totalLeads} label="Total Leads" accent="#6366f1" />
        <Stat value={stats.emailsSent} label="Emails Sent" accent="#0ea5e9" />
        <Stat value={stats.emailsOpened} label="Emails Opened" accent="#10b981" />
        <Stat value={`${stats.openRate}%`} label="Open Rate" accent="#10b981" />
        <Stat value={stats.linksClicked} label="Links Clicked" accent="#f59e0b" />
        <Stat value={`${stats.clickRate}%`} label="Click Rate" accent="#f59e0b" />
      </div>

      <h2 style={{ marginTop: 32 }}>Leads</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Requirement</th>
              <th>Category</th><th>Priority</th>
              <th>Sent</th><th>Opened</th><th>Clicked</th><th>Time</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l._id}>
                <td>{l.name}</td>
                <td>{l.email}</td>
                <td className="truncate">{l.requirement}</td>
                <td>{l.aiCategory}</td>
                <td><span className={`badge ${l.aiPriority?.toLowerCase()}`}>{l.aiPriority}</span></td>
                <td>{l.emailSent ? "✅" : "—"}</td>
                <td>{l.emailOpened ? "✅" : "—"}</td>
                <td>{l.linkClicked ? "✅" : "—"}</td>
                <td>{new Date(l.submissionTime).toLocaleString()}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 24 }}>No leads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
