import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import AnalyzePage from "./pages/AnalyzePage";
import LogsPage from "./pages/LogsPage";
import LogEntriesPage from "./pages/LogDetailPage.tsx";
import ExportLogsPage from "./pages/ExportLogsPage";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import { AuthProvider } from "./AuthContext";
import "./index.css";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <AnalyzePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <LogsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs/:logfileId"
            element={
              <ProtectedRoute>
                <LogEntriesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/export"
            element={
              <ProtectedRoute>
                <ExportLogsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
