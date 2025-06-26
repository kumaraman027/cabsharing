const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const MongoStore = require("connect-mongo");

dotenv.config();

// Connect MongoDB
const connectDB = require("./db");
connectDB();

const app = express();
const server = http.createServer(app);

// 🔐 Required for secure cookie/session forwarding from Vercel → Render
app.set("trust proxy", 1); // ✅ important for proxy handling on Render

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🟢 MongoDB Connected"))
  .catch((err) => console.error("❌ DB connection failed:", err));

// ✅ Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://cabsharing-s8da.vercel.app" // your Vercel frontend
  ],
  credentials: true // ✅ crucial for cookie-based auth
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Session config
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // ✅ match with your working env var
    collectionName: "sessions"
  }),
  cookie: {
    httpOnly: true,
    secure: true, // ✅ must be true on Render (uses HTTPS)
    sameSite: "none", // ✅ important for cross-origin cookies
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/ride", require("./routes/ride"));
app.use("/api/join", require("./routes/join"));
app.use("/api/chat", require("./routes/chat"));

app.get("/", (req, res) => {
  res.send("✅ Server is running.");
});

// ✅ Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://cabsharing-s8da.vercel.app"
    ],
    credentials: true
  }
});

const userSocketMap = {}; // email => socket.id

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("register", (email) => {
    console.log("📥 Registered:", email);
    userSocketMap[email] = socket.id;
  });

  socket.on("sendMessage", (msg) => {
    const receiverSocket = userSocketMap[msg.receiver];
    console.log(`✉️ Message from ${msg.sender} to ${msg.receiver}`);
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", msg);
    } else {
      console.log("⚠️ Receiver not connected:", msg.receiver);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
    for (const email in userSocketMap) {
      if (userSocketMap[email] === socket.id) {
        delete userSocketMap[email];
        break;
      }
    }
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
