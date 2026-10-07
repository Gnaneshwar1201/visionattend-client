import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get(`/attendance?date=${date}`).then((r) => setRecords(r.data));
  }, [date]);

  return (
    <div>
      <h1>Attendance Records</h1>
      <div className="card">
        <label>Filter by date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ maxWidth: 240 }}
        />
        <table className="table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ color: "#94a3b8", textAlign: "center", padding: 24 }}
                >
                  No records for {date}
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id}>
                  <td>{r.student?.rollNo}</td>
                  <td>{r.student?.name}</td>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                  <td>
                    <span className={`badge ${r.status}`}>{r.status}</span>
                  </td>
                  <td>
                    {r.confidence ? `${(r.confidence * 100).toFixed(1)}%` : "—"}
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
