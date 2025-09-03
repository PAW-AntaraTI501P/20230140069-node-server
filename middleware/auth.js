// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Ambil token dari header
  const authHeader = req.header("Authorization");

  // Cek jika tidak ada header Authorization
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Cek jika formatnya bukan 'Bearer <token>'
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Token format is incorrect, authorization denied" });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, "your_super_secret_jwt_key"); // Gunakan secret key yang sama

    // Tambahkan user dari payload token ke object request
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: "Token is not valid" });
  }
};
