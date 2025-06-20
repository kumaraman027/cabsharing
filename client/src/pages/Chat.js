import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatContext } from "../context/ChatContext";
import './Chat.css';

axios.defaults.withCredentials = true;

export default function Chat() {
  const { rideId, participantEmail } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const messagesEndRef = useRef(null);

  const { socket, clearUnread } = useContext(ChatContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me");
        setLoggedInUser(res.data.user);
        socket?.emit("register", res.data.user.email);
      } catch (err) {
        alert("Please login first.");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, socket]);

  useEffect(() => {
    if (loggedInUser) {
      clearUnread(rideId, participantEmail);
    }
  }, [rideId, participantEmail, loggedInUser, clearUnread]);

  useEffect(() => {
    if (!loggedInUser) return;
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chat/messages/${rideId}/${loggedInUser.email}/${participantEmail}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchMessages();
  }, [rideId, participantEmail, loggedInUser]);

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
  }, [participantEmail, loggedInUser, socket]);

  const handleSend = async () => {
    if (!input.trim() || !loggedInUser) return;

    const message = {
      rideId,
      sender: loggedInUser.email,
      receiver: participantEmail,
      text: input,
      timestamp: new Date().toISOString()
    };

    try {
      await axios.post("http://localhost:5000/api/chat/messages", message);
      socket.emit("sendMessage", message);
      setMessages((prev) => [...prev, message]);
      setInput("");
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!loggedInUser) return <div className="chat-container">Loading...</div>;

  return (
    <div className="chat-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Go Back</button>
      <h2 className="chat-header">Chat with {participantEmail}</h2>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.sender === loggedInUser.email ? "chat-sent" : "chat-received"
            }
          >
            <p>{msg.text}</p>
            <small>{new Date(msg.timestamp).toLocaleString()}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
