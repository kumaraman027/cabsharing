const jwt = require("jsonwebtoken");
const secret = "your_jwt_secret"; // Or use process.env.JWT_SECRET

module.exports = function (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attach user info to the request object
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};
