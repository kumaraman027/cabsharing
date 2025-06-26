import React, { useEffect, useRef, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatContext } from "../context/ChatContext";
import "./Chat.css";

axios.defaults.withCredentials = true;

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${rideId}_${participantEmail}`, JSON.stringify(messages));
    }
  }, [messages, rideId, participantEmail]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/api/auth/me`);
        setLoggedInUser(res.data.user);
      } catch (err) {
        console.error("❌ User auth failed:", err);
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (loggedInUser && socket) {
      socket.emit("register", loggedInUser.email);
    }
  }, [loggedInUser, socket]);

  const fetchMessages = useCallback(async () => {
    if (!loggedInUser) return;
    try {
      const res = await axios.get(
        `${API}/api/chat/messages/${rideId}/${loggedInUser.email}/${participantEmail}`
      );
      setMessages((prev) => {
        const seenTexts = new Set(prev.map((m) => m.text + m.timestamp));
        const unique = res.data.filter(
          (msg) => !seenTexts.has(msg.text + msg.timestamp)
        );
        const combined = [...prev, ...unique];
        combined.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return combined;
      });
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    }
  }, [rideId, participantEmail, loggedInUser]);

  useEffect(() => {
    if (loggedInUser && !hasLoaded.current) {
      hasLoaded.current = true;
      clearUnread(rideId, participantEmail);
      setTimeout(() => fetchMessages(), 500);
    }
  }, [loggedInUser, rideId, participantEmail, clearUnread, fetchMessages]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      console.error("❌ Failed to send message:", err);
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
                ? new Date(msg.timestamp).toLocaleTimeString()
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
