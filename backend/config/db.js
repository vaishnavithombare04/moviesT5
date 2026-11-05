
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Connection parameters
export const pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "movie_management",
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
