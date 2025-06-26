const mongoose = require("mongoose");

const JoinRequestSchema = new mongoose.Schema({
  rideId: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
  requester_name: { type: String, required: true },
  requester_email: { type: String, required: true },
  owner_email: { type: String, required: true },
  from_location: String,
  to_location: String,
  accepted: { type: Boolean, default: null }, // make it explicit
  seen: { type: Boolean, default: false },
  joined_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("JoinRequest", JoinRequestSchema);
