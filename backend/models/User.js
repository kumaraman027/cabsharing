const db = require("../db");

exports.createUser = (name, email, password, phone, callback) => {
  const query = "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)";
  db.query(query, [name, email, password, phone], callback);
};

exports.findUserByEmail = (email, callback) => {
  db.query("SELECT * FROM users WHERE email = ?", [email], callback);
};
