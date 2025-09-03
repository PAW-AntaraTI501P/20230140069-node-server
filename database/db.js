// src/database/db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

// Gunakan connection pool untuk performa yang lebih baik
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Cek koneksi saat aplikasi dimulai
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  if (connection) {
    console.log("Connected to the MySQL database successfully!");
    connection.release(); // Lepaskan koneksi setelah pemeriksaan
  }
});

// Ekspor pool yang sudah promise-based
module.exports = pool;