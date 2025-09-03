// src/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const router = express.Router();

// Endpoint Registrasi
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body; // Menerima 'name', 'email', dan 'password'
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Harap masukkan semua field" });
  }

  try {
    // Cek apakah email sudah terdaftar
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ msg: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan pengguna baru ke database dengan 'name'
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ msg: "Pendaftaran berhasil, silakan login." });
  } catch (err) {
    console.error("Kesalahan pendaftaran:", err);
    res.status(500).json({ msg: "Terjadi kesalahan server saat mendaftar" });
  }
});

// Endpoint Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Harap masukkan email dan password" });
  }

  try {
    // Cari pengguna berdasarkan email
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = results[0];

    if (!user) {
      return res.status(400).json({ msg: "Kredensial tidak valid" });
    }

    // Bandingkan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Kredensial tidak valid" });
    }

    // Buat token JWT
    const token = jwt.sign({ id: user.id }, "your_super_secret_jwt_key", { expiresIn: "1h" });

    // Kirim token dan data pengguna (termasuk 'name')
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Kesalahan login:", err);
    res.status(500).json({ msg: "Terjadi kesalahan server saat login" });
  }
});

module.exports = router;
