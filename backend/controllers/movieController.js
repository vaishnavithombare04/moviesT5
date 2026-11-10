import pool from "../config/db.js";


export const addMovie = async (req, res) => {
    try {
        const {title,genre_id,rating,duration,poster_url,trailer_url,description,release_year} = req.body;

        //  Validate input
        if (!title || !title.trim() || !poster_url || !trailer_url) {
            return res.status(400).json({
                success: false,
                message: "Title, poster_url, and trailer_url are required"
            });
        }

        const trimTitle = title.trim();

        // check if genre present
        if (genre_id) {
            const [genreExists] = await pool.query(
                "SELECT id FROM genres WHERE id = ?",
                [genre_id]
            );

            if (genreExists.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid genre_id: Specified genre does not exist"
                });
            }
        }

        //rating should be betn 0-10
        if (rating !== undefined && rating !== null && rating !== "") {
            const numRating = Number(rating);
            if (isNaN(numRating) || numRating < 0 || numRating > 10) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be a number between 0 and 10"
                });
            }
        }

        // check if movie exists
        const [existing] = await pool.query(
            "SELECT id FROM movies WHERE LOWER(title) = LOWER(?)",
            [trimTitle]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Movie already exists"
            });
        }

        // insert movie into database
        const [result] = await pool.query(
            "INSERT INTO movies (title, genre_id, rating, duration, poster_url, trailer_url, description, release_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                trimTitle,
                genre_id || null,
                rating || null,
                duration || null,
                poster_url,
                trailer_url,
                description || null,
                release_year || null
            ]
        );

        
        res.status(201).json({
            success: true,
            message: "Movie added successfully",
            movie: {
                id: result.insertId,
                title: trimTitle,
                genre_id: genre_id || null,
                rating: rating || null,
                duration: duration || null,
                poster_url,
                trailer_url,
                description: description || null,
                release_year: release_year || null
            }
        });

    } catch (error) {
        console.error("Add Movie Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const getAllMovies = async (req, res) => {
    try {
        const { search, genre_id, sort_by, order, page, limit } = req.query;

        let sql = `SELECT m.id,m.title,m.genre_id,g.name AS genre_name,m.rating,m.duration,m.poster_url,m.trailer_url,m.description,m.release_year,m.created_at,m.updated_at
            FROM movies m
            LEFT JOIN genres g ON m.genre_id = g.id`;
        let countSql = `SELECT COUNT(*) AS total FROM movies m`;
        const conditions = [];
        const params = [];

        // Search by title
        if (search && search.trim()) {
            conditions.push("LOWER(m.title) LIKE ?");
            params.push(`%${search.trim().toLowerCase()}%`);
        }

        // Filter by genre_id
        if (genre_id) {
            conditions.push("m.genre_id = ?");
            params.push(genre_id);
        }

        // Apply WHERE conditions if any exist
        if (conditions.length > 0) {
            const whereClause = " WHERE " + conditions.join(" AND ");
            sql += whereClause;
            countSql += whereClause;
        }

        // Sorting prevent sql injection
        const allowedSortFields = ["title", "rating", "duration", "release_year", "created_at"];
        const sortField = allowedSortFields.includes(sort_by) ? `m.${sort_by}` : "m.created_at";
        const sortOrder = (order && order.toUpperCase() === "ASC") ? "ASC" : "DESC";

        sql += ` ORDER BY ${sortField} ${sortOrder}`;

        // Pagination
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;
        const [totalRows] = await pool.query(countSql, params);
        const total = totalRows[0].total;
        sql += ` LIMIT ${limitNum} OFFSET ${offset}`;

        const [movies] = await pool.query(sql, params);

        res.status(200).json({
            success: true,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            limit: limitNum,
            movies
        });

    } catch (error) {
        console.error("Get All Movies Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid movie ID"
            });
        }

        const [movies] = await pool.query(`SELECT m.id,m.title,m.genre_id,g.name AS genre_name,m.rating,m.duration,m.poster_url,m.trailer_url,m.description,m.release_year,m.created_at,m.updated_at
            FROM movies m
            LEFT JOIN genres g ON m.genre_id = g.id
            WHERE m.id = ?`, [id]);

        if (movies.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        res.status(200).json({
            success: true,
            movie: movies[0]
        });

    } catch (error) {
        console.error("Get Movie By ID Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



export const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            genre_id,
            rating,
            duration,
            poster_url,
            trailer_url,
            description,
            release_year
        } = req.body;

        // Validate id
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid movie ID"
            });
        }

        //required fields
        if (!title || !title.trim() || !poster_url || !trailer_url) {
            return res.status(400).json({
                success: false,
                message: "Title, poster_url, and trailer_url are required"
            });
        }

        const trimTitle = title.trim();

        //check if movie exists
        const [existingMovie] = await pool.query(
            "SELECT id FROM movies WHERE id = ?",
            [id]
        );

        if (existingMovie.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        //check if title is already used by another movie
        const [duplicateTitle] = await pool.query(
            "SELECT id FROM movies WHERE LOWER(title) = LOWER(?) AND id != ?",
            [trimTitle, id]
        );

        if (duplicateTitle.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Movie title already in use by another movie"
            });
        }

        //check if genre id exists
        if (genre_id) {
            const [genreExists] = await pool.query(
                "SELECT id FROM genres WHERE id = ?",
                [genre_id]
            );

            if (genreExists.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid genre_id: Specified genre does not exist"
                });
            }
        }

        //Validate rating if provided
        if (rating !== undefined && rating !== null && rating !== "") {
            const numRating = Number(rating);
            if (isNaN(numRating) || numRating < 0 || numRating > 10) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be a number between 0 and 10"
                });
            }
        }

        //update movie in database
        await pool.query(
            `UPDATE movies SET title = ?, genre_id = ?, rating = ?, duration = ?, poster_url = ?, trailer_url = ?, description = ?, release_year = ? WHERE id = ?`,
            [
                trimTitle,
                genre_id || null,
                rating || null,
                duration || null,
                poster_url,
                trailer_url,
                description || null,
                release_year || null,
                id
            ]
        );

        res.status(200).json({
            success: true,
            message: "Movie updated successfully",
            movie: {
                id: Number(id),
                title: trimTitle,
                genre_id: genre_id || null,
                rating: rating || null,
                duration: duration || null,
                poster_url,
                trailer_url,
                description: description || null,
                release_year: release_year || null
            }
        });

    } catch (error) {
        console.error("Update Movie Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



export const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid movie ID"
            });
        }

        // check if movie exists
        const [movie] = await pool.query(
            "SELECT id FROM movies WHERE id = ?",
            [id]
        );

        if (movie.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Movie not found"
            });
        }

        // delete movie from database
        await pool.query("DELETE FROM movies WHERE id = ?", [id]);

        res.status(200).json({
            success: true,
            message: "Movie deleted successfully"
        });

    } catch (error) {
        console.error("Delete Movie Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


