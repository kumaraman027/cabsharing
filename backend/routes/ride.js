const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ POST /api/ride/post - Post a new ride
router.post("/post", (req, res) => {
  const { from, to, date, time, seats, fare, rideType, userEmail } = req.body;

  if (!from || !to || !date || !time || !seats || !fare || !rideType || !userEmail) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const sql = `
    INSERT INTO rides (from_location, to_location, date, time, seats, available_seats, fare, ride_type, user_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [from, to, date, time, seats, seats, fare, rideType, userEmail], (err, result) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Database error." });
    }
    res.status(201).json({ message: "Ride posted successfully!" });
  });
});

// ✅ GET /api/ride/all - Get all upcoming rides
router.get("/all", (req, res) => {
  const sql = `
    SELECT * FROM rides 
    WHERE date >= CURDATE()
    ORDER BY date ASC, time ASC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching rides:", err);
      return res.status(500).json({ error: "Failed to fetch rides" });
    }
    res.json(results);
  });
});

// ✅ GET /api/ride/joined/:email - Rides joined by user (accepted only)
router.get("/joined/:email", (req, res) => {
  const email = req.params.email;

  const sql = `
    SELECT * FROM join_requests 
    WHERE requester_email = ? AND accepted = 1
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error fetching joined rides:", err);
      return res.status(500).json({ error: "Failed to fetch joined rides." });
    }
    res.json(results);
  });
});

// ✅ GET /api/ride/accepted-by-owner/:email - Requests accepted by this ride owner
router.get("/accepted-by-owner/:email", (req, res) => {
  const email = req.params.email;

  const sql = `
    SELECT * FROM join_requests 
    WHERE owner_email = ? AND accepted = 1
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error fetching accepted requests:", err);
      return res.status(500).json({ error: "Failed to fetch data." });
    }
    res.json(results);
  });
});

// ✅ DELETE /api/ride/delete-expired - Optional: delete expired rides
router.delete("/delete-expired", (req, res) => {
  const sql = `DELETE FROM rides WHERE date < CURDATE()`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error deleting old rides:", err);
      return res.status(500).json({ error: "Failed to delete expired rides" });
    }
    res.json({ message: `Deleted ${result.affectedRows} expired rides.` });
  });
});

module.exports = router;
