const express = require("express");
const router = express.Router();
const Ride = require("../models/Ride");
const JoinRequest = require("../models/JoinRequest");

// ✅ POST /api/ride/post - Post a new ride
router.post("/post", async (req, res) => {
  const { from, to, date, time, seats, fare, rideType, userEmail } = req.body;

  if (!from || !to || !date || !time || !seats || !fare || !rideType || !userEmail) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const ride = new Ride({
      from_location: from,
      to_location: to,
      date: new Date(date),
      time,
      seats,
      available_seats: seats,
      fare,
      ride_type: rideType,
      user_email: userEmail
    });

    await ride.save();
    res.status(201).json({ message: "Ride posted successfully!" });
  } catch (err) {
    console.error("MongoDB error:", err);
    res.status(500).json({ error: "Database error." });
  }
});

// ✅ GET /api/ride/all - Get all upcoming rides (after cleaning expired ones)
router.get("/all", async (req, res) => {
  try {
    const now = new Date();

    // Remove expired rides first
    await Ride.deleteMany({
      $or: [
        { date: { $lt: now } }, // Older date
        {
          date: { $eq: now.toISOString().split("T")[0] }, // Same date
          time: { $lt: now.toTimeString().slice(0, 5) } // Time passed
        }
      ]
    });

    const upcomingRides = await Ride.find({
      $or: [
        { date: { $gt: now } },
        {
          date: { $eq: now.toISOString().split("T")[0] },
          time: { $gte: now.toTimeString().slice(0, 5) }
        }
      ]
    }).sort({ date: 1, time: 1 });

    res.json(upcomingRides);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch rides" });
  }
});

// ✅ GET /api/ride/joined/:email - Rides joined by user
router.get("/joined/:email", async (req, res) => {
  try {
    const requests = await JoinRequest.find({
      requester_email: req.params.email,
      accepted: true
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch joined rides." });
  }
});

// ✅ GET /api/ride/accepted-by-owner/:email - Accepted requests for owner
router.get("/accepted-by-owner/:email", async (req, res) => {
  try {
    const accepted = await JoinRequest.find({
      owner_email: req.params.email,
      accepted: true
    });

    res.json(accepted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

// ✅ DELETE /api/ride/delete-expired - (Optional separate cleanup route)
router.delete("/delete-expired", async (req, res) => {
  try {
    const now = new Date();

    const result = await Ride.deleteMany({
      $or: [
        { date: { $lt: now } },
        {
          date: { $eq: now.toISOString().split("T")[0] },
          time: { $lt: now.toTimeString().slice(0, 5) }
        }
      ]
    });

    res.json({ message: `Deleted ${result.deletedCount} expired rides.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expired rides" });
  }
});

module.exports = router;
