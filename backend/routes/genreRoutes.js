import express from "express";
import {
    createGenre,
    getAllGenres,
    getGenreById,
    updateGenre,
    deleteGenre
} from "../controllers/genreController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (All users and visitors can browse genres)
router.get("/", getAllGenres);
router.get("/:id", getGenreById);

// Admin-only routes (Requires valid JWT and admin role)
router.post("/", verifyToken, verifyAdmin, createGenre);
router.put("/:id", verifyToken, verifyAdmin, updateGenre);
router.delete("/:id", verifyToken, verifyAdmin, deleteGenre);

export default router;

