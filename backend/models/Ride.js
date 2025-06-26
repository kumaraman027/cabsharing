const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
  from_location: String,
  to_location: String,
  date: { type: Date, required: true },
  time: String,
  seats: Number,
  available_seats: Number,
  fare: Number,
  ride_type: String,
  user_email: String
});

module.exports = mongoose.model("Ride", RideSchema);
