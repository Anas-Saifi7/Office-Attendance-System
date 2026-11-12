import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";


import Profile from "./pages/employee/Profile";
import ChangePassword from "./pages/employee/ChangePassword";
import AttendanceHistory from "./pages/employee/AttendanceHistory";

import ApplyLeave from "./pages/employee/ApplyLeave";
import MyLeaves from "./pages/employee/MyLeaves";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>

      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="employee">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute role="employee">
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute role="employee">
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance-history"
        element={
          <ProtectedRoute role="employee">
            <AttendanceHistory />
          </ProtectedRoute>
        }
      />

       <Route
        path="/apply-leave"
        element={
          <ProtectedRoute role="employee">
            <ApplyLeave />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-leaves"
        element={
          <ProtectedRoute role="employee">
            <MyLeaves />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={
              user
                ? user.role === "admin"
                  ? "/admin"
                  : "/dashboard"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}
