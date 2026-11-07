
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";

import { verifyToken, verifyAdmin } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes); 
app.use("/api/genres", genreRoutes); 
app.use("/api/movies", movieRoutes);
app.get("/test", (req, res) => {
    res.send("Test route working");
});

app.get("/", (req, res) => {
    res.send("Movie Management System Backend is Running!");// Test API
});


app.get("/api/db-test", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS connected");

        res.json({
            success: true,
            message: "MySQL connected successfully!",
            data: rows,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user
  });
});

app.get(
  "/api/admin-test",verifyToken,verifyAdmin,
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted",
      user: req.user
    });
  }
);


app.listen(6500, () => {
    console.log("Server running on http://localhost:6500");
});
