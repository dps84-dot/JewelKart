const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config({
    path: path.resolve(__dirname, "../../.env")
});

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

pool.on("connect", () => {
    console.log("PostgreSQL database connected successfully");
});

pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err);
});

module.exports = pool;