import pool from "../config/db.js";

// @desc    Create a new genre
// @route   POST /api/genres
// @access  Private (Admin only)
export const createGenre = async (req, res) => {
    try {
        const { name } = req.body;

        // 1. Validate input
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Genre name is required"
            });
        }

        const trimmedName = name.trim();

        // 2. Check if genre already exists
        const [existing] = await pool.query(
            "SELECT id FROM genres WHERE LOWER(name) = LOWER(?)",
            [trimmedName]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Genre already exists"
            });
        }

        // 3. Insert genre into database
        const [result] = await pool.query(
            "INSERT INTO genres (name) VALUES (?)",
            [trimmedName]
        );

        res.status(201).json({
            success: true,
            message: "Genre created successfully",
            genre: {
                id: result.insertId,
                name: trimmedName
            }
        });

    } catch (error) {
        console.error("Create Genre Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// @desc    Get all genres
// @route   GET /api/genres
// @access  Public
export const getAllGenres = async (req, res) => {
    try {
        const [genres] = await pool.query(
            "SELECT id, name, created_at FROM genres ORDER BY name ASC"
        );

        res.status(200).json({
            success: true,
            count: genres.length,
            genres
        });

    } catch (error) {
        console.error("Get All Genres Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// @desc    Get a single genre by ID
// @route   GET /api/genres/:id
// @access  Public
export const getGenreById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid genre ID"
            });
        }

        const [genres] = await pool.query(
            "SELECT id, name, created_at FROM genres WHERE id = ?",
            [id]
        );

        if (genres.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Genre not found"
            });
        }

        res.status(200).json({
            success: true,
            genre: genres[0]
        });

    } catch (error) {
        console.error("Get Genre By ID Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// @desc    Update a genre
// @route   PUT /api/genres/:id
// @access  Private (Admin only)
export const updateGenre = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid genre ID"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Genre name is required"
            });
        }

        const trimmedName = name.trim();

        // 1. Check if the genre exists
        const [genre] = await pool.query(
            "SELECT id FROM genres WHERE id = ?",
            [id]
        );

        if (genre.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Genre not found"
            });
        }

        // 2. Check if another genre already uses this name
        const [duplicate] = await pool.query(
            "SELECT id FROM genres WHERE LOWER(name) = LOWER(?) AND id != ?",
            [trimmedName, id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Genre name already exists"
            });
        }

        // 3. Update the genre
        await pool.query(
            "UPDATE genres SET name = ? WHERE id = ?",
            [trimmedName, id]
        );

        res.status(200).json({
            success: true,
            message: "Genre updated successfully",
            genre: {
                id: Number(id),
                name: trimmedName
            }
        });

    } catch (error) {
        console.error("Update Genre Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// @desc    Delete a genre
// @route   DELETE /api/genres/:id
// @access  Private (Admin only)
export const deleteGenre = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid genre ID"
            });
        }

        // 1. Check if genre exists
        const [genre] = await pool.query(
            "SELECT id FROM genres WHERE id = ?",
            [id]
        );

        if (genre.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Genre not found"
            });
        }

        // 2. Delete genre
        await pool.query(
            "DELETE FROM genres WHERE id = ?",
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Genre deleted successfully"
        });

    } catch (error) {
        console.error("Delete Genre Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

