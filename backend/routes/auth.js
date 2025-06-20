const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = "your_secret_key"; // 🔐 Use env vars in production
const COOKIE_NAME = "token";

// ✅ Register Route
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Email already exists." });
      }
      return res.status(500).json({ error: "Database error." });
    }
    res.status(201).json({ success: true, userId: result.insertId });
  });
});

// ✅ Login Route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error." });

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const user = results[0];

      // 🔐 Generate JWT token
      const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, {
        expiresIn: "7d"
      });

      // 🍪 Set httpOnly cookie
      res
        .cookie(COOKIE_NAME, token, {
          httpOnly: true,
          secure: false, // change to true in production (HTTPS)
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .json({ success: true, user: { email: user.email, name: user.name } });
    }
  );
});

// ✅ Logout Route
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME).json({ success: true, message: "Logged out" });
});

// ✅ Authenticated User Route
router.get("/me", (req, res) => {
  const token = req.cookies[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
