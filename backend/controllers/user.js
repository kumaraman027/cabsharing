const User = require("../models/User");

exports.createUser = (name, email, password, phone, callback) => {
  const newUser = new User({ name, email, password, phone });
  newUser.save(callback);
};

exports.findUserByEmail = (email, callback) => {
  User.findOne({ email }).exec(callback);
};

