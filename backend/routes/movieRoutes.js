import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import {
    addMovie,
    getAllMovies,
    getMovieById
} from "../controllers/movieController.js";

const router = express.Router();

// Public routes 
router.get("/", getAllMovies);
router.get("/:id", getMovieById);

// Admin routes
router.post("/", verifyToken, verifyAdmin, addMovie);

export default router;
