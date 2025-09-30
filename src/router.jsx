// src/router/index.jsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/Pages/Dashboard";
import LoginPage from "@/components/Login";
import NotFoundPage from "@/Pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅
export default function AppRoutes() {
  return (
    <Routes>
      {/* ✅ Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* ✅ Main Pages محمية */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* ✅ Theme (Nested Routes محمية)
      <Route path="theme">
        <Route
          index
          element={
            <ProtectedRoute>
              <Theme />
            </ProtectedRoute>
          }
        />
        <Route
          path="add"
          element={
            <ProtectedRoute>
              <ThemeAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute>
              <ThemeEdit />
            </ProtectedRoute>
          }
        />
      </Route> */}

      {/* ❌ 404 - Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
