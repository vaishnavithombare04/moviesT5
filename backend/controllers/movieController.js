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


