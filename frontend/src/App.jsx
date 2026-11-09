import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AddMoviePage from "./pages/AddMoviePage";
import AddGenrePage from "./pages/AddGenrePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Unauthenticated Routes (Redirects to Home if already logged in) */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Authenticated User / Admin Home Catalog (Redirects to Login if not authenticated) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/movies" element={<Navigate to="/" replace />} />

          {/* Admin-Only Management Routes */}
          <Route
            path="/movies/new"
            element={
              <ProtectedRoute adminOnly={true}>
                <AddMoviePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/genres/new"
            element={
              <ProtectedRoute adminOnly={true}>
                <AddGenrePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
