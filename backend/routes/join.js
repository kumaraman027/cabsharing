const express = require("express");
const router = express.Router();
const JoinRequest = require("../models/JoinRequest");
const Ride = require("../models/Ride");

// POST → Submit a join request
router.post("/", async (req, res) => {
  const {
    ride_id,
    requester_name,
    requester_email,
    owner_email,
    from_location,
    to_location
  } = req.body;

  if (!ride_id || !requester_email || !owner_email || !requester_name) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // prevent duplicate requests
    const existing = await JoinRequest.findOne({
      rideId: ride_id,
      requester_email
    });

    if (existing) {
      return res.status(409).json({ error: "You have already requested to join this ride." });
    }

    const join = new JoinRequest({
      rideId: ride_id,
      requester_name,
      requester_email,
      owner_email,
      from_location,
      to_location
    });

    await join.save();
    res.status(201).json({ message: "Join request submitted successfully." });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Failed to insert join request." });
  }
});

// GET → Requests sent by user
router.get("/user/:email", async (req, res) => {
  try {
    const requests = await JoinRequest.find({ requester_email: req.params.email });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch join requests." });
  }
});

// GET → Requests received by ride owner
router.get("/owner/:email", async (req, res) => {
  try {
    const requests = await JoinRequest.find({ owner_email: req.params.email });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests." });
  }
});

// GET → Accepted requests where current user is ride owner
router.get("/accepted-by-owner/:email", async (req, res) => {
  try {
    const requests = await JoinRequest.find({
      owner_email: req.params.email,
      accepted: true
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch accepted requests." });
  }
});

// GET → All join data (for seat count)
router.get("/all", async (req, res) => {
  try {
    const requests = await JoinRequest.find({}, "rideId accepted");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch join data." });
  }
});

// PUT → Accept a join request and decrease available seats
router.put("/:id/accept", async (req, res) => {
  const requestId = req.params.id;

  try {
    const request = await JoinRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    if (request.accepted !== null) {
      return res.status(400).json({ error: "Request already handled." });
    }

    const ride = await Ride.findById(request.rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found." });
    }

    // Check how many have been accepted already
    const acceptedCount = await JoinRequest.countDocuments({
      rideId: ride._id,
      accepted: true
    });

    const seatsLeft = ride.seats - acceptedCount;
    if (seatsLeft <= 0) {
      return res.status(400).json({ error: "Ride is already full." });
    }

    request.accepted = true;
    request.seen = true;
    await request.save();

    ride.available_seats = Math.max(ride.available_seats - 1, 0);
    await ride.save();

    res.json({ message: "Join request accepted and seat updated." });
  } catch (err) {
    console.error("Accept error:", err);
    res.status(500).json({ error: "Failed to accept request." });
  }
});

// PUT → Reject a request
router.put("/:id/reject", async (req, res) => {
  try {
    const request = await JoinRequest.findByIdAndUpdate(
      req.params.id,
      { accepted: false, seen: true },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    res.json({ message: "Join request rejected." });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ error: "Failed to reject request." });
  }
});

module.exports = router;
