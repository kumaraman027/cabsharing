const db = require("../db");

exports.sendJoinRequest = (join, callback) => {
  const query = "INSERT INTO join_requests (ride_id, user_id, ride_owner_id, joined_at) VALUES (?, ?, ?, ?)";
  const values = [join.rideId, join.userId, join.rideOwnerId, join.joinedAt];
  db.query(query, values, callback);
};

exports.getRequestsForOwner = (ownerId, callback) => {
  db.query("SELECT * FROM join_requests WHERE ride_owner_id = ?", [ownerId], callback);
};

exports.updateRequestStatus = (id, status, callback) => {
  db.query("UPDATE join_requests SET accepted = ? WHERE id = ?", [status, id], callback);
};
