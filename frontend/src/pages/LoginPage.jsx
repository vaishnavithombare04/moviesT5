import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Validate fields in real-time
  const getErrors = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errs.email = '"Email" is not allowed to be empty';
    } else if (!emailRegex.test(formData.email)) {
      errs.email = '"Email" must be a valid email';
    }

    if (!formData.password) {
      errs.password = '"Password" is not allowed to be empty';
    }

    return errs;
  };

  const errors = getErrors();
  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isFormValid) return;

    setLoading(true);
    setServerError("");

    try {
      const response = await authAPI.login(formData);
      // Save auth 
      login(response.user, response.token);
      navigate("/");
    } catch (err) {
      setServerError(err.message || "Failed to login. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-layout">
      <div className="val-form-container">
        <h2 className="val-form-title">Login</h2>

        {serverError && (
          <div className="val-alert-danger" style={{ marginBottom: "18px" }}>
            ⚠️ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <div className="val-input-group">
            <label className="val-label">Email</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">✉️</span>
              <input
                type="email"
                name="email"
                className={`val-input ${
                  touched.email
                    ? errors.email
                      ? "has-error"
                      : "is-valid"
                    : ""
                }`}
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.email && errors.email && (
              <div className="val-alert-danger">⚠️ {errors.email}</div>
            )}
          </div>

          {/* Password Input */}
          <div className="val-input-group">
            <label className="val-label">Password</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">🔒</span>
              <input
                type="password"
                name="password"
                className={`val-input ${
                  touched.password
                    ? errors.password
                      ? "has-error"
                      : "is-valid"
                    : ""
                }`}
                placeholder="Please enter your password..."
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.password && errors.password && (
              <div className="val-alert-danger">⚠️ {errors.password}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`val-btn ${!isFormValid || loading ? "disabled" : ""}`}
            disabled={!isFormValid || loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="val-hint-text">
            Button automatically disabled while form has errors.
          </p>

          <p className="val-hint-text" style={{ marginTop: "16px" }}>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
