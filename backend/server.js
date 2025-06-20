const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ Allow credentials (cookies) from React frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ✅ All API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/ride", require("./routes/ride"));
app.use("/api/join", require("./routes/join"));
app.use("/api/chat", require("./routes/chat"));

app.get("/", (req, res) => {
  res.send("✅ Server is running and accepting connections.");
});

// ✅ Setup Socket.IO with CORS config
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

// ✅ Map email → socketId
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("🟢 New socket connected:", socket.id);

  socket.on("register", (email) => {
    console.log("🔐 Registered user:", email);
    userSocketMap[email] = socket.id;
  });

  socket.on("sendMessage", (msg) => {
    const { receiver } = msg;
    const receiverSocket = userSocketMap[receiver];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", msg);
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
server.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});
