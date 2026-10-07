import { useState } from "react";
import api from "../api/axios";

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 6 * 86400000)
    .toISOString()
    .slice(0, 10);
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  const [busy, setBusy] = useState("");

  const download = async (type) => {
    setBusy(type);
    try {
      const res = await api.get(`/reports/${type}?from=${from}&to=${to}`, {
        responseType: "blob",
      });
      const mimes = {
        excel:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        csv: "text/csv",
      };
      const exts = { excel: "xlsx", word: "docx", pptx: "pptx", csv: "csv" };
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: mimes[type] }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_${from}_to_${to}.${exts[type]}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed: " + (e.response?.data?.message || e.message));
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <h1>Reports</h1>
      <div className="card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <label>From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label>To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
        <div className="grid">
          <button onClick={() => download("excel")} disabled={!!busy}>
            {busy === "excel" ? "Generating…" : "📊 Excel (.xlsx)"}
          </button>
          <button onClick={() => download("word")} disabled={!!busy}>
            {busy === "word" ? "Generating…" : "📄 Word (.docx)"}
          </button>
          <button onClick={() => download("pptx")} disabled={!!busy}>
            {busy === "pptx" ? "Generating…" : "📽 PowerPoint (.pptx)"}
          </button>
          <button
            className="secondary"
            onClick={() => download("csv")}
            disabled={!!busy}
          >
            {busy === "csv" ? "Generating…" : "📋 CSV"}
          </button>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>What's included</h3>
        <ul
          style={{
            paddingLeft: 20,
            color: "#94a3b8",
            lineHeight: 1.9,
            fontSize: 14,
          }}
        >
          <li>
            <b>Excel</b> — Full table: roll no, name, date, time, status,
            confidence.
          </li>
          <li>
            <b>Word</b> — Formatted summary report with data table.
          </li>
          <li>
            <b>PowerPoint</b> — Title + stats + bar chart per student.
          </li>
          <li>
            <b>CSV</b> — Raw data for external analysis.
          </li>
        </ul>
      </div>
    </div>
  );
}
