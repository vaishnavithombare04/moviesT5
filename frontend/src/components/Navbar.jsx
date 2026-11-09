import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="app-nav">
      <Link to={user ? "/" : "/login"} className="brand-wrapper">
        <span style={{ fontSize: "1.3rem", cursor: "pointer", color: "#94a3b8" }}>☰</span>
        <span className="brand-title">Movies</span>
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link-item ${isActive ? "active" : ""}`
              }
            >
              Home
            </NavLink>

            {isAdmin && (
              <>
                <NavLink
                  to="/movies/new"
                  className={({ isActive }) =>
                    `nav-link-item ${isActive ? "active" : ""}`
                  }
                >
                  Add Movie
                </NavLink>
                <NavLink
                  to="/genres/new"
                  className={({ isActive }) =>
                    `nav-link-item ${isActive ? "active" : ""}`
                  }
                >
                  Add Genre
                </NavLink>
              </>
            )}

            {isAdmin ? (
              <span className="badge-admin">Admin: {user.email}</span>
            ) : (
              <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                {user.email}
              </span>
            )}

            <button onClick={handleLogout} className="logout-btn">
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `nav-link-item ${isActive ? "active" : ""}`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `nav-link-item ${isActive ? "active" : ""}`
              }
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
