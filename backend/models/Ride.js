// models/Ride.js
const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  from_location: String,
  to_location: String,
  date: Date, // e.g., "2025-06-27"
  time: String, // e.g., "15:30"
  seats: Number,
  available_seats: Number,
  fare: Number,
  ride_type: String,
  user_email: String,
});

module.exports = mongoose.model("Ride", rideSchema);
