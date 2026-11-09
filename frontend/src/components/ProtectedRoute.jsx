import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guard for routes that require authentication
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
        Loading authentication state...
      </div>
    );
  }

  // Not logged in -> Redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Requires admin, but user is not admin -> Redirect to home
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Guard for routes that should only be accessible when NOT logged in (e.g. /login, /register)
export const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Already logged in -> Redirect directly to home catalog
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
