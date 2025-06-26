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
    const rideDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (rideDateTime <= now) {
      return res.status(400).json({ error: "Ride time must be in the future." });
    }

    const ride = new Ride({
      from_location: from,
      to_location: to,
      date: new Date(date),
      time,
      seats,
      available_seats: seats,
      fare,
      ride_type: rideType,
      user_email: userEmail,
    });

    await ride.save();
    res.status(201).json({ message: "Ride posted successfully!" });
  } catch (err) {
    console.error("MongoDB error:", err);
    res.status(500).json({ error: "Database error." });
  }
});

// ✅ GET /api/ride/all - Get all upcoming rides
router.get("/all", async (req, res) => {
  try {
    const now = new Date();

    // Combine date + time and compare with now
    const rides = await Ride.aggregate([
      {
        $addFields: {
          rideDateTime: {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  "T",
                  "$time"
                ]
              }
            }
          }
        }
      },
      {
        $match: {
          rideDateTime: { $gte: now }
        }
      },
      {
        $sort: {
          rideDateTime: 1
        }
      }
    ]);

    res.json(rides);
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
      accepted: true,
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch joined rides." });
  }
});

// ✅ GET /api/ride/accepted-by-owner/:email
router.get("/accepted-by-owner/:email", async (req, res) => {
  try {
    const accepted = await JoinRequest.find({
      owner_email: req.params.email,
      accepted: true,
    });

    res.json(accepted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

// ✅ DELETE /api/ride/delete-expired - Delete expired rides (based on date + time)
router.delete("/delete-expired", async (req, res) => {
  try {
    const now = new Date();

    const result = await Ride.deleteMany({
      $expr: {
        $lt: [
          {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  "T",
                  "$time"
                ]
              }
            }
          },
          now
        ]
      }
    });

    res.json({ message: `Deleted ${result.deletedCount} expired rides.` });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete expired rides" });
  }
});

module.exports = router;
