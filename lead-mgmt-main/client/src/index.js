import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LeadForm from "./components/LeadForm";
import Dashboard from "./components/Dashboard";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <span className="brand">⚡ LeadFlow</span>
        <div className="nav-links">
          <Link to="/">Submit Lead</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<LeadForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
