import React, { useState, useEffect } from "react";
import { movieAPI } from "../services/api";

const EditMovieModal = ({ movie, genres, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    genre_id: "",
    rating: "",
    duration: "",
    poster_url: "",
    trailer_url: "",
    description: "",
    release_year: "",
  });

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill form with existing movie data
  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || "",
        genre_id: movie.genre_id ? movie.genre_id.toString() : "",
        rating: movie.rating !== null && movie.rating !== undefined ? movie.rating.toString() : "",
        duration: movie.duration !== null && movie.duration !== undefined ? movie.duration.toString() : "",
        poster_url: movie.poster_url || "",
        trailer_url: movie.trailer_url || "",
        description: movie.description || "",
        release_year: movie.release_year ? movie.release_year.toString() : "",
      });
    }
  }, [movie]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.poster_url.trim() || !formData.trailer_url.trim()) {
      setServerError("Title, poster URL, and trailer URL are required.");
      return;
    }

    if (formData.rating !== "") {
      const num = Number(formData.rating);
      if (isNaN(num) || num < 0 || num > 10) {
        setServerError("Rating must be a number between 0 and 10.");
        return;
      }
    }

    setLoading(true);
    setServerError("");

    try {
      const updatedMovie = {
        title: formData.title.trim(),
        genre_id: formData.genre_id ? Number(formData.genre_id) : null,
        rating: formData.rating ? Number(formData.rating) : null,
        duration: formData.duration ? Number(formData.duration) : null,
        poster_url: formData.poster_url.trim(),
        trailer_url: formData.trailer_url.trim(),
        description: formData.description.trim() || null,
        release_year: formData.release_year ? Number(formData.release_year) : null,
      };

      await movieAPI.update(movie.id, updatedMovie);
      onUpdated(); // Trigger refresh on parent
      onClose();   // Close modal
    } catch (err) {
      setServerError(err.message || "Failed to update movie.");
    } finally {
      setLoading(false);
    }
  };

  if (!movie) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Movie: {movie.title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {serverError && (
          <div className="val-alert-danger" style={{ marginBottom: "16px" }}>
            ⚠️ {serverError}
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
                className="val-input"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Genre */}
          <div className="val-input-group">
            <label className="val-label">Genre</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">📂</span>
              <select
                name="genre_id"
                className="val-input"
                value={formData.genre_id}
                onChange={handleChange}
              >
                <option value="">Uncategorized</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating */}
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
                className="val-input"
                value={formData.rating}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="val-input-group">
            <label className="val-label">Duration (minutes)</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">⏱️</span>
              <input
                type="number"
                name="duration"
                className="val-input"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Poster URL */}
          <div className="val-input-group">
            <label className="val-label">Poster Image URL</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">🖼️</span>
              <input
                type="url"
                name="poster_url"
                className="val-input"
                value={formData.poster_url}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Trailer Link */}
          <div className="val-input-group">
            <label className="val-label">Trailer Link (YouTube)</label>
            <div className="val-input-wrapper">
              <span className="val-input-icon">🔗</span>
              <input
                type="url"
                name="trailer_url"
                className="val-input"
                value={formData.trailer_url}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="val-input-group">
            <label className="val-label">Description (Synopsis)</label>
            <textarea
              name="description"
              className="val-input"
              style={{ height: "80px", padding: "10px 14px", resize: "vertical" }}
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
                value={formData.release_year}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="modal-btn-row">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="val-btn"
              style={{ flex: 1, marginTop: 0 }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovieModal;

