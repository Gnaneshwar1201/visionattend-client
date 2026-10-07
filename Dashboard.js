import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState({ present: 0, late: 0, onTime: 0 });
  const [recent, setRecent] = useState([]);
  const [chart, setChart] = useState([]);

  useEffect(() => {
    api
      .get("/attendance/stats/today")
      .then((r) => setStats(r.data))
      .catch(() => {});
    api
      .get("/attendance")
      .then((r) => setRecent(r.data.slice(0, 8)))
      .catch(() => {});

    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toISOString().slice(5, 10),
      });
    }
    Promise.all(
      days.map((d) =>
        api
          .get(`/attendance?date=${d.date}`)
          .then((r) => r.data.length)
          .catch(() => 0),
      ),
    ).then((counts) =>
      setChart(days.map((d, i) => ({ day: d.label, count: counts[i] }))),
    );
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid">
        <div className="card">
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Present Today</p>
          <div className="stat" style={{ color: "#4ade80" }}>
            {stats.present}
          </div>
        </div>
        <div className="card">
          <p style={{ color: "#94a3b8", fontSize: 13 }}>On Time</p>
          <div className="stat" style={{ color: "#3b82f6" }}>
            {stats.onTime}
          </div>
        </div>
        <div className="card">
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Late</p>
          <div className="stat" style={{ color: "#f87171" }}>
            {stats.late}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chart}>
            <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Recent Attendance</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{ color: "#94a3b8", textAlign: "center" }}
                >
                  No records yet
                </td>
              </tr>
            ) : (
              recent.map((r) => (
                <tr key={r._id}>
                  <td>{r.student?.name}</td>
                  <td>{r.student?.rollNo}</td>
                  <td>{r.time}</td>
                  <td>
                    <span className={`badge ${r.status}`}>{r.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
