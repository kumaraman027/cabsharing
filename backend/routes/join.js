const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/join → Submit a join request
router.post("/", (req, res) => {
  const {
    ride_id,
    requester_name,
    requester_email,
    owner_email,
    from_location,
    to_location,
  } = req.body;

  if (!ride_id || !requester_email || !owner_email || !requester_name) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const sql = `
    INSERT INTO join_requests 
    (ride_id, requester_name, requester_email, owner_email, from_location, to_location, joined_at, seen, accepted) 
    VALUES (?, ?, ?, ?, ?, ?, NOW(), FALSE, NULL)
  `;

  db.query(
    sql,
    [ride_id, requester_name, requester_email, owner_email, from_location, to_location],
    (err, result) => {
      if (err) {
        console.error("Error inserting join request:", err);
        return res.status(500).json({ error: "Failed to insert join request." });
      }
      res.status(201).json({ message: "Join request submitted successfully." });
    }
  );
});

// GET /api/join/user/:email → Fetch requests sent by user
router.get("/user/:email", (req, res) => {
  const email = req.params.email;
  const sql = `SELECT * FROM join_requests WHERE requester_email = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error fetching user join requests:", err);
      return res.status(500).json({ error: "Failed to fetch join requests" });
    }
    res.json(results);
  });
});

// GET /api/join/owner/:email → Fetch join requests sent to this user's rides
router.get("/owner/:email", (req, res) => {
  const email = req.params.email;
  const sql = `SELECT * FROM join_requests WHERE owner_email = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error fetching owner's ride join requests:", err);
      return res.status(500).json({ error: "Failed to fetch requests" });
    }
    res.json(results);
  });
});

// GET /api/join/accepted-by-owner/:email → Fetch accepted requests for rides posted by this user
router.get("/accepted-by-owner/:email", (req, res) => {
  const email = req.params.email;
  const sql = `SELECT * FROM join_requests WHERE owner_email = ? AND accepted = 1`;
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error fetching accepted join requests for owner:", err);
      return res.status(500).json({ error: "Failed to fetch accepted requests" });
    }
    res.json(results);
  });
});

// GET /api/join/all → Used to count accepted users per ride
router.get("/all", (req, res) => {
  const sql = `SELECT ride_id, accepted FROM join_requests`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching all join data:", err);
      return res.status(500).json({ error: "Failed to fetch join data" });
    }
    res.json(results);
  });
});

// PUT /api/join/:id/accept → Accept a request & reduce seat count
router.put("/:id/accept", (req, res) => {
  const { id } = req.params;

  const updateRequestSql = `
    UPDATE join_requests 
    SET accepted = 1, seen = 1 
    WHERE id = ? AND accepted IS NULL
  `;

  db.query(updateRequestSql, [id], (err, result) => {
    if (err) {
      console.error("Accept error:", err);
      return res.status(500).json({ error: "Failed to accept request" });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Request already accepted or invalid." });
    }

    const getRideIdSql = `SELECT ride_id FROM join_requests WHERE id = ?`;
    db.query(getRideIdSql, [id], (err, rows) => {
      if (err || rows.length === 0) {
        console.error("Ride fetch error:", err);
        return res.status(500).json({ error: "Could not fetch ride_id." });
      }

      const rideId = rows[0].ride_id;

      const updateSeatsSql = `
        UPDATE rides 
        SET available_seats = available_seats - 1 
        WHERE id = ? AND available_seats > 0
      `;

      db.query(updateSeatsSql, [rideId], (err, result) => {
        if (err) {
          console.error("Error updating seats:", err);
          return res.status(500).json({ error: "Failed to update ride seat count." });
        }

        if (result.affectedRows === 0) {
          return res.status(400).json({ error: "No available seats left." });
        }

        res.json({ message: "Join request accepted & seat updated." });
      });
    });
  });
});

// PUT /api/join/:id/reject → Reject a request
router.put("/:id/reject", (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE join_requests SET accepted = 0, seen = 1 WHERE id = ?`;
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Reject error:", err);
      return res.status(500).json({ error: "Failed to reject request" });
    }
    res.json({ message: "Join request rejected" });
  });
});

module.exports = router;