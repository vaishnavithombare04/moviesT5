const BASE_URL = "http://localhost:6500/api";

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data;
};

// Auth API calls
export const authAPI = {
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
};

// Genre API calls
export const genreAPI = {
  getAll: () => apiRequest("/genres"),
  getById: (id) => apiRequest(`/genres/${id}`),
  create: (name) =>
    apiRequest("/genres", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  update: (id, name) =>
    apiRequest(`/genres/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  delete: (id) =>
    apiRequest(`/genres/${id}`, {
      method: "DELETE",
    }),
};

// Movie API calls
export const movieAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.genre_id) query.append("genre_id", params.genre_id);
    if (params.sort_by) query.append("sort_by", params.sort_by);
    if (params.order) query.append("order", params.order);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const queryString = query.toString();
    return apiRequest(`/movies${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id) => apiRequest(`/movies/${id}`),
  create: (movieData) =>
    apiRequest("/movies", {
      method: "POST",
      body: JSON.stringify(movieData),
    }),
  update: (id, movieData) =>
    apiRequest(`/movies/${id}`, {
      method: "PUT",
      body: JSON.stringify(movieData),
    }),
  delete: (id) =>
    apiRequest(`/movies/${id}`, {
      method: "DELETE",
    }),
};

