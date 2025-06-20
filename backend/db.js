const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Aman098",  // make sure this is correct
  database: "cabclique",
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  } else {
    console.log("✅ MySQL connected");
  }
});

module.exports = db;
