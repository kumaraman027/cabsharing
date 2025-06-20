import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

export const ChatContext = createContext();

export const ChatProvider = ({ user, children }) => {
  const [unreadMap, setUnreadMap] = useState({});
  const [socket, setSocket] = useState(null);

  // ✅ Fetch unread counts on load
  useEffect(() => {
    if (!user?.email) return;

    const fetchUnread = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/unread/${user.email}`);
        setUnreadMap(res.data || {});
      } catch (err) {
        console.error("Error fetching unread messages:", err);
      }
    };

    fetchUnread();
  }, [user]);

  // ✅ Setup socket
  useEffect(() => {
    if (!user?.email) return;

    const s = io("http://localhost:5000", {
      withCredentials: true
    });

    s.emit("register", user.email);
    setSocket(s);

    s.on("receiveMessage", (msg) => {
      const key = `${msg.rideId}_${msg.sender}`;
      setUnreadMap((prev) => ({
        ...prev,
        [key]: (prev[key] || 0) + 1,
      }));
    });

    return () => {
      s.disconnect();
    };
  }, [user]);

  // ✅ Clear unread (from context + backend)
  const clearUnread = async (rideId, participantEmail) => {
    const key = `${rideId}_${participantEmail}`;

    // Remove from context
    setUnreadMap((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    // Clear on backend
    try {
      await axios.post("http://localhost:5000/api/chat/mark-as-read", {
        rideId,
        participantEmail,
        email: user.email, // current user
      });
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  return (
    <ChatContext.Provider value={{ socket, unreadMap, clearUnread }}>
      {children}
    </ChatContext.Provider>
  );
};




