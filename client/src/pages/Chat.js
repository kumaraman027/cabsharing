import React, { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatContext } from "../context/ChatContext";
import "./Chat.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function Chat() {
  const { rideId, participantEmail } = useParams();
  const navigate = useNavigate();
  const { socket, clearUnread } = useContext(ChatContext);

  const [messages, setMessages] = useState(() => {
    try {
      const cached = localStorage.getItem(`chat_${rideId}_${participantEmail}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const messagesEndRef = useRef(null);
  const hasLoaded = useRef(false);

  // Save messages locally
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${rideId}_${participantEmail}`, JSON.stringify(messages));
    }
  }, [messages, rideId, participantEmail]);

  // Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/api/auth/me`);
        setLoggedInUser(res.data.user);
      } catch (err) {
        console.error("❌ Auth failed:", err);
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  // Register socket for this user
  useEffect(() => {
    if (loggedInUser && socket) {
      socket.emit("register", loggedInUser.email);
    }
  }, [loggedInUser, socket]);

  // Fetch initial chat messages
  const fetchMessages = useCallback(async () => {
    if (!loggedInUser) return;
    try {
      const res = await axios.get(
        `${API}/api/chat/messages/${rideId}/${loggedInUser.email}/${participantEmail}`
      );
      const seenIds = new Set(messages.map((m) => m._id || m.timestamp));
      const newMessages = res.data.filter(
        (m) => !seenIds.has(m._id || m.timestamp)
      );
      const combined = [...messages, ...newMessages];
      combined.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(combined);
    } catch (err) {
      console.error("❌ Error loading chat:", err);
    }
  }, [rideId, loggedInUser, participantEmail, messages]);

  // On initial load
  useEffect(() => {
    if (loggedInUser && !hasLoaded.current) {
      hasLoaded.current = true;
      clearUnread(rideId, participantEmail);
      fetchMessages();
    }
  }, [loggedInUser, rideId, participantEmail, fetchMessages, clearUnread]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket || !loggedInUser) return;

    const handleReceive = (msg) => {
      if (
        (msg.sender === participantEmail && msg.receiver === loggedInUser.email) ||
        (msg.sender === loggedInUser.email && msg.receiver === participantEmail)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [socket, loggedInUser, participantEmail]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !loggedInUser) return;

    const message = {
      rideId,
      sender: loggedInUser.email,
      receiver: participantEmail,
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setInput("");

    try {
      socket.emit("sendMessage", message);
      await axios.post(`${API}/api/chat/messages`, message);
    } catch (err) {
      console.error("❌ Send failed:", err);
    }
  };

  if (!loggedInUser) return <div className="chat-container">Loading...</div>;

  return (
    <div className="chat-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Go Back
      </button>
      <h2 className="chat-header">Chat with {participantEmail}</h2>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.sender === loggedInUser.email ? "chat-sent" : "chat-received"}
          >
            <p>{msg.text}</p>
            <small>
              {msg.timestamp
                ? new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Sending..."}
            </small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
