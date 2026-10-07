import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/students")
      .then((r) => setStudents(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    await api.delete(`/students/${id}`);
    load();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1 style={{ marginBottom: 0 }}>Students</h1>
        <Link to="/students/new">
          <button>+ Register Student</button>
        </Link>
      </div>
      <div className="card">
        {loading ? (
          <p style={{ color: "#94a3b8" }}>Loading…</p>
        ) : students.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>
            No students yet. Click "Register Student" to add one.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Face</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.rollNo}</td>
                  <td>{s.name}</td>
                  <td>{s.email || "—"}</td>
                  <td>
                    {s.faceDescriptors?.length
                      ? `✓ (${s.faceDescriptors.length})`
                      : "—"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="danger" onClick={() => del(s._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
