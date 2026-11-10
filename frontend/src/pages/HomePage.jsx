import React, { useState, useEffect, useCallback } from "react";
import { movieAPI, genreAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import EditMovieModal from "../components/EditMovieModal";

const HomePage = () => {
  const { isAdmin } = useAuth();

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState(0);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Flipped card tracking: only flips on CLICK
  const [flippedCards, setFlippedCards] = useState({});

  // Editing movie state for modal
  const [editingMovie, setEditingMovie] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // 1. Fetch Genres
  const fetchGenres = async () => {
    try {
      const response = await genreAPI.getAll();
      setGenres(response.genres || []);
    } catch (err) {
      console.error("Failed to load genres:", err.message);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // 2. Fetch Movies
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: 6,
        sort_by: "created_at",
        order: "DESC",
      };

      if (selectedGenre) params.genre_id = selectedGenre;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await movieAPI.getAll(params);

      let fetchedMovies = response.movies || [];

      // Optional client-side min rating filter
      if (minRating > 0) {
        fetchedMovies = fetchedMovies.filter(
          (m) => Number(m.rating || 0) >= minRating
        );
      }

      setMovies(fetchedMovies);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load movies.");
    } finally {
      setLoading(false);
    }
  }, [selectedGenre, searchQuery, minRating, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMovies]);

  // Toggle Flip ONLY when clicked
  const toggleFlip = (movieId) => {
    setFlippedCards((prev) => ({
      ...prev,
      [movieId]: !prev[movieId],
    }));
  };

  // Delete Movie (Admin)
  const handleDeleteMovie = async (e, movieId, movieTitle) => {
    e.stopPropagation(); // Do not flip card

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${movieTitle}"?`
    );
    if (!confirmDelete) return;

    try {
      await movieAPI.delete(movieId);
      setActionMsg(`Movie "${movieTitle}" deleted successfully!`);
      setTimeout(() => setActionMsg(""), 3000);
      fetchMovies(); // refresh list
    } catch (err) {
      alert(err.message || "Failed to delete movie.");
    }
  };

  // Delete Genre (Admin)
  const handleDeleteGenre = async (e, genreId, genreName) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(
      `Delete genre "${genreName}"? Movies in this genre will become Uncategorized.`
    );
    if (!confirmDelete) return;

    try {
      await genreAPI.delete(genreId);
      if (selectedGenre === genreId.toString()) {
        setSelectedGenre("");
      }
      fetchGenres();
      fetchMovies();
    } catch (err) {
      alert(err.message || "Failed to delete genre.");
    }
  };

  // Star Rating filter
  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => setMinRating(minRating === i ? 0 : i)}
          title={`Filter: ${i}+ Rating (Click again to clear)`}
          style={{
            cursor: "pointer",
            color: i <= minRating ? "#fbbf24" : "#475569",
            transition: "color 0.2s",
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="catalog-content">
      {/* edit movie */}
      {editingMovie && (
        <EditMovieModal
          movie={editingMovie}
          genres={genres}
          onClose={() => setEditingMovie(null)}
          onUpdated={() => {
            setActionMsg(`Movie "${editingMovie.title}" updated successfully!`);
            setTimeout(() => setActionMsg(""), 3000);
            fetchMovies();
          }}
        />
      )}

      {/* sidebar */}
      <aside className="catalog-sidebar">
        <h4>Filters</h4>
        <ul className="genre-filter-list">
          <li
            className={`genre-filter-item ${selectedGenre === "" ? "active" : ""}`}
            onClick={() => {
              setSelectedGenre("");
              setPage(1);
            }}
          >
            <span>All</span>
            <span>{totalCount}</span>
          </li>
          {genres.map((g) => (
            <li
              key={g.id}
              className={`genre-filter-item ${
                selectedGenre === g.id.toString() || selectedGenre === g.id
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setSelectedGenre(g.id.toString());
                setPage(1);
              }}
            >
              <span>{g.name}</span>
              {isAdmin && (
                <button
                  onClick={(e) => handleDeleteGenre(e, g.id, g.name)}
                  title="Delete genre (Admin)"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#f87171",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    padding: "0 4px",
                  }}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>

        <h4>Rating</h4>
        <div className="star-rating-box">{renderStarRating()}</div>
        <small style={{ color: "#64748b", fontSize: "0.75rem", display: "block" }}>
          {minRating > 0 ? `Filtered: ${minRating}.0+ Rating` : "Click stars to filter rating"}
        </small>
        {minRating > 0 && (
          <button
            onClick={() => setMinRating(0)}
            style={{
              background: "transparent",
              border: "none",
              color: "#38bdf8",
              fontSize: "0.75rem",
              cursor: "pointer",
              padding: "4px 0",
              marginTop: "4px",
              textDecoration: "underline",
            }}
          >
            Clear rating filter
          </button>
        )}
      </aside>

      {/* main grid */}
      <main className="main-catalog">
        {/* Search Box */}
        <input
          type="text"
          className="search-box-input"
          placeholder="Search movie by title..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
        />

        <p className="movie-count-text">
          {loading ? "Searching movies..." : `${movies.length} movies displayed (${totalCount} total).`}
        </p>

        {actionMsg && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid #10b981",
              color: "#6ee7b7",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "0.85rem",
              margin: "6px 0",
            }}
          >
            ✓ {actionMsg}
          </div>
        )}

        {error && (
          <div className="val-alert-danger" style={{ margin: "10px 0" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && movies.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
              background: "#131724",
              borderRadius: "8px",
              color: "#94a3b8",
            }}
          >
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }}>
              🎬
            </span>
            <h3 style={{ color: "#f8fafc", margin: "0 0 8px 0" }}>No movies found</h3>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Try adjusting your search query, genre selection, or rating filter.
            </p>
          </div>
        )}

        {/* cards */}
        <div className="cards-grid">
          {movies.map((movie) => {
            const isFlipped = !!flippedCards[movie.id];

            return (
              <div
                key={movie.id}
                className={`flip-card-container ${isFlipped ? "is-flipped" : ""}`}
                onClick={() => toggleFlip(movie.id)}
                title="Click card to flip"
              >
                <div className="flip-card-inner">
                  {/* movie det */}
                  <div className="card-front">
                    <div className="movie-poster-box">
                      {movie.poster_url ? (
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = "🎬";
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "3rem" }}>🎬</span>
                      )}

                      {movie.rating && (
                        <span className="rate-badge">★ {movie.rating}</span>
                      )}
                    </div>

                    <div className="card-info">
                      <div>
                        <h4 className="card-title" title={movie.title}>
                          {movie.title}
                        </h4>
                        <p className="card-meta">
                          {movie.duration ? `${movie.duration} min` : "N/A"} /{" "}
                          {movie.genre_name || "Uncategorized"}
                        </p>
                      </div>

                      {/* trailer button*/}
                      {movie.trailer_url && (
                        <a
                          href={movie.trailer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="trailer-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Watch Trailer ▶
                        </a>
                      )}

                      {/* admin buttons */}
                      {isAdmin && (
                        <div className="card-admin-actions">
                          <button
                            className="btn-card-edit"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents flipping card
                              setEditingMovie(movie);
                            }}
                            title="Edit movie"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-card-delete"
                            onClick={(e) =>
                              handleDeleteMovie(e, movie.id, movie.title)
                            }
                            title="Delete movie"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* movie desc */}
                  <div className="card-back">
                    <div>
                      <h5>{movie.title}</h5>
                      <p>
                        {movie.description || "No synopsis available for this movie."}
                      </p>
                    </div>

                    <div>
                      {isAdmin && (
                        <div className="card-admin-actions" style={{ marginBottom: "8px" }}>
                          <button
                            className="btn-card-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMovie(movie);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-card-delete"
                            onClick={(e) =>
                              handleDeleteMovie(e, movie.id, movie.title)
                            }
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                      <div className="flip-hint">⟲ Click card to flip back</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              ‹ Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${page === p ? "active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next ›
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
