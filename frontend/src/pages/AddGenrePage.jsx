import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { genreAPI } from "../services/api";

const AddGenrePage = () => {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Validation
  const error = !name.trim() ? '"Genre" is required' : "";
  const isFormValid = !error;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isFormValid) return;

    setLoading(true);
    setServerError("");
    setSuccessMsg("");

    try {
      await genreAPI.create(name.trim());
      setSuccessMsg(`Genre "${name.trim()}" created successfully!`);
      setName("");
      setTouched(false);
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setServerError(err.message || "Failed to create genre.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-layout">
      <div className="val-form-container">
        <h2 className="val-form-title">Add New Genre</h2>

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
          <div className="val-input-group">
            <label className="val-label">Genre Name</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">🏷️</span>
              <input
                type="text"
                className={`val-input ${
                  touched ? (error ? "has-error" : "is-valid") : ""
                }`}
                placeholder="e.g. Documentary"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setServerError("");
                }}
                onBlur={() => setTouched(true)}
              />
            </div>
            {touched && error && (
              <div className="val-alert-danger">⚠️ {error}</div>
            )}
          </div>

          <button
            type="submit"
            className={`val-btn ${!isFormValid || loading ? "disabled" : ""}`}
            disabled={!isFormValid || loading}
          >
            {loading ? "Saving Genre..." : "Save Genre"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGenrePage;
