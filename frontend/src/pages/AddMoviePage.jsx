import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { movieAPI, genreAPI } from "../services/api";

const AddMoviePage = () => {
  const [formData, setFormData] = useState({
    title: "",
    genre_id: "",
    rating: "",
    duration: "",
    poster_url: "",
    trailer_url: "",
    description: "",
    release_year: new Date().getFullYear().toString(),
  });

  const [genres, setGenres] = useState([]);
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Load genres for select dropdown
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await genreAPI.getAll();
        const loadedGenres = response.genres || [];
        setGenres(loadedGenres);
        if (loadedGenres.length > 0) {
          setFormData((prev) => ({ ...prev, genre_id: loadedGenres[0].id.toString() }));
        }
      } catch (err) {
        console.error("Failed to load genres:", err.message);
      }
    };
    fetchGenres();
  }, []);

  // Validation matching Screen 4 of flowcharts.html
  const getErrors = () => {
    const errs = {};

    if (!formData.title.trim()) {
      errs.title = '"Title" is required';
    }

    if (!formData.poster_url.trim()) {
      errs.poster_url = '"Poster URL" is required';
    }

    if (!formData.trailer_url.trim()) {
      errs.trailer_url = '"Trailer link" is required';
    }

    if (formData.rating !== "" && formData.rating !== null) {
      const num = Number(formData.rating);
      if (isNaN(num) || num < 0 || num > 10) {
        errs.rating = '"Rating" must be between 0 and 10';
      }
    }

    if (formData.duration !== "" && formData.duration !== null) {
      const num = Number(formData.duration);
      if (isNaN(num) || num <= 0) {
        errs.duration = '"Movie length" must be a positive number';
      }
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
      title: true,
      poster_url: true,
      trailer_url: true,
      rating: true,
      duration: true,
    });

    if (!isFormValid) return;

    setLoading(true);
    setServerError("");
    setSuccessMsg("");

    try {
      await movieAPI.create({
        title: formData.title.trim(),
        genre_id: formData.genre_id ? Number(formData.genre_id) : null,
        rating: formData.rating ? Number(formData.rating) : null,
        duration: formData.duration ? Number(formData.duration) : null,
        poster_url: formData.poster_url.trim(),
        trailer_url: formData.trailer_url.trim(),
        description: formData.description.trim() || null,
        release_year: formData.release_year ? Number(formData.release_year) : null,
      });

      setSuccessMsg(`Movie "${formData.title.trim()}" added successfully!`);
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setServerError(err.message || "Failed to add movie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-layout">
      <div className="val-form-container" style={{ maxWidth: "620px" }}>
        <h2 className="val-form-title">Add New Movie</h2>

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
          {/* Title */}
          <div className="val-input-group">
            <label className="val-label">Title</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">🎬</span>
              <input
                type="text"
                name="title"
                className={`val-input ${
                  touched.title
                    ? errors.title
                      ? "has-error"
                      : "is-valid"
                    : ""
                }`}
                placeholder="e.g. Inception"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.title && errors.title && (
              <div className="val-alert-danger">⚠️ {errors.title}</div>
            )}
          </div>

          {/* Genre Dropdown */}
          <div className="val-input-group">
            <label className="val-label">Genre</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">📂</span>
              <select
                name="genre_id"
                className="val-input is-valid"
                value={formData.genre_id}
                onChange={handleChange}
              >
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating (0 - 10) */}
          <div className="val-input-group">
            <label className="val-label">Rating (0 - 10)</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">⭐</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="rating"
                className={`val-input ${
                  touched.rating
                    ? errors.rating
                      ? "has-error"
                      : "is-valid"
                    : ""
                }`}
                placeholder="e.g. 8.8"
                value={formData.rating}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.rating && errors.rating && (
              <div className="val-alert-danger">⚠️ {errors.rating}</div>
            )}
          </div>

          {/* Movie Length (Runtime) */}
          <div className="val-input-group">
            <label className="val-label">Movie Length (Runtime in mins)</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">⏱️</span>
              <input
                type="number"
                min="1"
                name="duration"
                className={`val-input ${
                  touched.duration
                    ? errors.duration
                      ? "has-error"
                      : "is-valid"
                    : ""
                }`}
                placeholder="e.g. 148"
                value={formData.duration}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.duration && errors.duration && (
              <div className="val-alert-danger">⚠️ {errors.duration}</div>
            )}
          </div>

          {/* Movie Poster Image URL */}
          <div className="val-input-group">
            <label className="val-label">Movie Poster Image URL</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">🖼️</span>
              <input
                type="url"
                name="poster_url"
                className={`val-input ${
                  touched.poster_url
                    ? errors.poster_url
                      ? "has-error"
                      : "is-valid"
                    : ""
                }`}
                placeholder="https://example.com/poster.jpg"
                value={formData.poster_url}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.poster_url && errors.poster_url && (
              <div className="val-alert-danger">⚠️ {errors.poster_url}</div>
            )}
          </div>

          {/* Trailer Link (YouTube) */}
          <div className="val-input-group">
            <label className="val-label">Trailer Link (YouTube)</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">🔗</span>
              <input
                type="url"
                name="trailer_url"
                className={`val-input ${
                  touched.trailer_url
                    ? errors.trailer_url
                      ? "has-error"
                      : "is-valid"
                    : ""
                }`}
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.trailer_url}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            {touched.trailer_url && errors.trailer_url && (
              <div className="val-alert-danger">⚠️ {errors.trailer_url}</div>
            )}
          </div>

          {/* Description (Synopsis) */}
          <div className="val-input-group">
            <label className="val-label">Description (Synopsis)</label>
            <textarea
              name="description"
              className="val-input"
              style={{ height: "90px", padding: "10px 14px", resize: "vertical" }}
              placeholder="A brief synopsis of the movie..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Release Year */}
          <div className="val-input-group">
            <label className="val-label">Release Year</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">📅</span>
              <input
                type="number"
                name="release_year"
                className="val-input"
                placeholder="e.g. 2026"
                value={formData.release_year}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`val-btn ${!isFormValid || loading ? "disabled" : ""}`}
            disabled={!isFormValid || loading}
          >
            {loading ? "Saving Movie..." : "Save Movie"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMoviePage;
