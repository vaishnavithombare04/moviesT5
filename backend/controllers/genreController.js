import pool from "../config/db.js";


export const createGenre = async (req, res) => {
    try {
        const { name } = req.body;

        //  Validate input
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Genre name is required"
            });
        }

        const trimmedName = name.trim();

        // Check if genre already exists
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

        //  Insert genre into database
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

        //  Check if the genre exists
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

        // Check if  genre already is there
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

        // Update the genre
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


export const deleteGenre = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid genre ID"
            });
        }

        //  Check if genre exists
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

        //  Delete genre
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

