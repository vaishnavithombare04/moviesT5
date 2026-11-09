import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    repeat_password: "",
  });

  const [touched, setTouched] = useState({
    full_name: false,
    email: false,
    password: false,
    repeat_password: false,
  });

  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Validate fields matching Screen 3 of flowcharts.html
  const getErrors = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.full_name.trim()) {
      errs.full_name = '"Full Name" is not allowed to be empty';
    }

    if (!formData.email.trim()) {
      errs.email = '"Email" is not allowed to be empty';
    } else if (!emailRegex.test(formData.email)) {
      errs.email = '"Email" must be a valid email';
    }

    if (!formData.password) {
      errs.password = '"Password" is not allowed to be empty';
    } else if (formData.password.length < 8) {
      errs.password = '"Password" length must be at least 8 characters long';
    }

    if (!formData.repeat_password) {
      errs.repeat_password = '"Repeat Password" is not allowed to be empty';
    } else if (formData.repeat_password !== formData.password) {
      errs.repeat_password = "The passwords do not match.";
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
    setTouched({
      full_name: true,
      email: true,
      password: true,
      repeat_password: true,
    });

    if (!isFormValid) return;

    setLoading(true);
    setServerError("");
    setSuccessMsg("");

    try {
      await authAPI.register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccessMsg("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setServerError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-layout">
      <div className="val-form-container">
        <h2 className="val-form-title">Register Form</h2>

        {serverError && (
          <div className="val-alert-danger" style={{ marginBottom: "18px" }}>
            ⚠️ {serverError}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid #10b981",
              color: "#6ee7b7",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "0.85rem",
              marginBottom: "18px",
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name Input */}
          <div className="val-input-group">
            <label className="val-label">Full Name</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">👤</span>
              <input
                type="text"
                name="full_name"
                className={`val-input ${
                  touched.full_name
                    ? errors.full_name
                      ? "has-error"
                      : "is-valid"
                    : ""
                }`}
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.full_name && errors.full_name && (
              <div className="val-alert-danger">⚠️ {errors.full_name}</div>
            )}
          </div>

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
                placeholder="newuser@gmail.com"
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
                placeholder="At least 8 characters..."
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.password && errors.password && (
              <div className="val-alert-danger">⚠️ {errors.password}</div>
            )}
          </div>

          {/* Repeat Password Input */}
          <div className="val-input-group">
            <label className="val-label">Repeat Password</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">🔒</span>
              <input
                type="password"
                name="repeat_password"
                className={`val-input ${
                  touched.repeat_password
                    ? errors.repeat_password
                      ? "has-error"
                      : "is-valid"
                    : ""
                }`}
                placeholder="Re-enter password..."
                value={formData.repeat_password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.repeat_password && errors.repeat_password && (
              <div className="val-alert-danger">⚠️ {errors.repeat_password}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`val-btn ${!isFormValid || loading ? "disabled" : ""}`}
            disabled={!isFormValid || loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="val-hint-text">
            Validates email structure, 8+ character password, and confirmation match.
          </p>

          <p className="val-hint-text" style={{ marginTop: "16px" }}>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
