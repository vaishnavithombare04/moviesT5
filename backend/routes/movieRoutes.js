import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import {addMovie,getAllMovies,getMovieById,updateMovie,deleteMovie} from "../controllers/movieController.js";

const router = express.Router();

// Public routes
router.get("/", getAllMovies);
router.get("/:id", getMovieById);

// Admin routes
router.post("/", verifyToken, verifyAdmin, addMovie);
router.put("/:id", verifyToken, verifyAdmin, updateMovie);
router.delete("/:id", verifyToken, verifyAdmin, deleteMovie);

export default router;
