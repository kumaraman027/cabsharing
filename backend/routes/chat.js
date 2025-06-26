const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Save incoming message to DB
router.post("/messages", async (req, res) => {
  const { rideId, sender, receiver, text, timestamp } = req.body;

  if (!rideId || !sender || !receiver || !text) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const newMsg = new Message({
      rideId,
      sender,
      receiver,
      text,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });
    await newMsg.save();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("MongoDB insert failed:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get messages between two users for a ride
router.get("/messages/:rideId/:user1/:user2", async (req, res) => {
  const { rideId, user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      rideId,
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("MongoDB fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get unread message counts per ride+sender for a user
router.get("/unread/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const unread = await Message.aggregate([
      { $match: { receiver: email, seen: false } },
      {
        $group: {
          _id: { rideId: "$rideId", sender: "$sender" },
          count: { $sum: 1 }
        }
      }
    ]);

    const map = {};
    unread.forEach(row => {
      const key = `${row._id.rideId}_${row._id.sender}`;
      map[key] = row.count;
    });

    res.json(map);
  } catch (err) {
    console.error("MongoDB unread fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch unread messages" });
  }
});

// Mark messages as read
router.post("/mark-as-read", async (req, res) => {
  const { rideId, participantEmail, email } = req.body;

  try {
    await Message.updateMany(
      {
        rideId,
        sender: participantEmail,
        receiver: email,
        seen: false
      },
      { $set: { seen: true } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("MongoDB mark-as-read failed:", err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

module.exports = router;
