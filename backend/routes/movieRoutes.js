import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import { addMovie } from "../controllers/movieController.js";

const router = express.Router();
router.post("/", verifyToken, verifyAdmin, addMovie);
export default router;

