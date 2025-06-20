const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Save incoming message to DB
router.post("/messages", (req, res) => {
  const { rideId, sender, receiver, text } = req.body;

  if (!rideId || !sender || !receiver || !text) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sql = `
    INSERT INTO messages (ride_id, sender, receiver, text, timestamp, seen)
    VALUES (?, ?, ?, ?, NOW(), 0)
  `;

  db.query(sql, [rideId, sender, receiver, text], (err) => {
    if (err) {
      console.error("DB insert failed:", err);
      return res.status(500).json({ error: "Failed to send message" });
    }

    res.status(200).json({ success: true });
  });
});

// ✅ Get messages between two users
router.get("/messages/:rideId/:user1/:user2", (req, res) => {
  const { rideId, user1, user2 } = req.params;

  const sql = `
    SELECT * FROM messages 
    WHERE ride_id = ? AND (
      (sender = ? AND receiver = ?) OR
      (sender = ? AND receiver = ?)
    )
    ORDER BY timestamp ASC
  `;

  db.query(sql, [rideId, user1, user2, user2, user1], (err, results) => {
    if (err) {
      console.error("DB fetch failed:", err);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }

    res.json(results);
  });
});

// ✅ Get unread counts per ride+sender for a user
router.get("/unread/:email", (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT ride_id, sender, COUNT(*) as count
    FROM messages
    WHERE receiver = ? AND seen = 0
    GROUP BY ride_id, sender
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Unread fetch failed:", err);
      return res.status(500).json({ error: "Failed to fetch unread messages" });
    }

    const map = {};
    results.forEach((row) => {
      const key = `${row.ride_id}_${row.sender}`;
      map[key] = row.count;
    });

    res.json(map);
  });
});

// ✅ Mark messages as read
router.post("/mark-as-read", (req, res) => {
  const { rideId, participantEmail, email } = req.body;

  const sql = `
    UPDATE messages
    SET seen = 1
    WHERE ride_id = ? AND sender = ? AND receiver = ? AND seen = 0
  `;

  db.query(sql, [rideId, participantEmail, email], (err) => {
    if (err) {
      console.error("Mark read error:", err);
      return res.status(500).json({ error: "Failed to mark as read" });
    }

    res.json({ success: true });
  });
});

module.exports = router;
