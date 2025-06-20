const db = require("../db");

exports.postRide = (ride, callback) => {
  const query = "INSERT INTO rides (from_location, to_location, date, time, seats, fare, ride_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [ride.from, ride.to, ride.date, ride.time, ride.seats, ride.fare, ride.rideType, ride.userId];
  db.query(query, values, callback);
};

exports.getAllRides = (callback) => {
  db.query("SELECT * FROM rides", callback);
};
