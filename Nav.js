import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Nav() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="nav">
      <strong style={{ color: "#3b82f6", fontSize: 16 }}>
        🎯 VisionAttend
      </strong>
      <NavLink to="/" end>
        Dashboard
      </NavLink>
      <NavLink to="/students">Students</NavLink>
      <NavLink to="/students/new">Register Face</NavLink>
      <NavLink to="/attendance">Attendance</NavLink>
      <NavLink to="/attendance/mark">Mark Attendance</NavLink>
      <NavLink to="/reports">Reports</NavLink>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <span style={{ color: "#94a3b8", fontSize: 13 }}>{user.name}</span>
        <button className="secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
