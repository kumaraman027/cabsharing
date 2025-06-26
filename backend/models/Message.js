const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  rideId: { type: String, required: true },
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  seen: { type: Boolean, default: false }
});

// TTL index to auto-delete messages older than 4 days (4 * 24 * 60 * 60 = 345600 seconds)
MessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 345600 });

module.exports = mongoose.model("Message", MessageSchema);
