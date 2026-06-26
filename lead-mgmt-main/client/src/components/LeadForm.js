import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API || "";

const empty = { name: "", email: "", phone: "", company: "", requirement: "" };

export default function LeadForm() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setResult(null);
    setMessage("");

    try {
      const { data } = await axios.post(`${API}/api/leads`, form);
      setResult(data.lead);
      setMessage(data.message || "");
      setStatus("success");
      setForm(empty);
    } catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="card form-card">
      <h1>Get in Touch</h1>
      <p className="subtitle">Fill out the form and we'll reach out automatically.</p>

      <form onSubmit={handleSubmit}>
        <label>Full Name *
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Rahul Sharma" />
        </label>
        <label>Email Address *
          <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="rahul@gmail.com" />
        </label>
        <label>Phone Number *
          <input name="phone" value={form.phone} onChange={handleChange} required placeholder="9876543210" />
        </label>
        <label>Company Name
          <input name="company" value={form.company} onChange={handleChange} placeholder="ABC Pvt Ltd (optional)" />
        </label>
        <label>Requirement / Message *
          <textarea name="requirement" value={form.requirement} onChange={handleChange} required rows={3} placeholder="Need AI automation" />
        </label>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Submitting..." : "Submit"}
        </button>
      </form>

      {status === "success" && result && (
        <div className={`alert ${result.emailSent ? "success" : "error"}`}>
          {result.emailSent ? (
            <>Thanks! A personalized email was sent to <strong>{result.email}</strong>.</>
          ) : (
            <>{message || "Your lead was saved, but the email was not sent. Please check SMTP settings."}</>
          )}
          <div className="ai-tag">
            AI classification: <strong>{result.aiCategory}</strong> | Priority: <strong>{result.aiPriority}</strong>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="alert error">{message}</div>
      )}
    </div>
  );
}
