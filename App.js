import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Nav from "./components/Nav";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import RegisterStudent from "./pages/RegisterStudent";
import Attendance from "./pages/Attendance";
import AttendanceMark from "./pages/AttendanceMark";
import Reports from "./pages/Reports";

const Private = ({ children }) =>
  useAuth().user ? children : <Navigate to="/login" />;

export default function App() {
  return (
    <>
      <Nav />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Private>
                <Dashboard />
              </Private>
            }
          />
          <Route
            path="/students"
            element={
              <Private>
                <Students />
              </Private>
            }
          />
          <Route
            path="/students/new"
            element={
              <Private>
                <RegisterStudent />
              </Private>
            }
          />
          <Route
            path="/attendance"
            element={
              <Private>
                <Attendance />
              </Private>
            }
          />
          <Route
            path="/attendance/mark"
            element={
              <Private>
                <AttendanceMark />
              </Private>
            }
          />
          <Route
            path="/reports"
            element={
              <Private>
                <Reports />
              </Private>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}
