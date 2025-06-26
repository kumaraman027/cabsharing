import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

export const ChatContext = createContext();

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export const ChatProvider = ({ user, children }) => {
  const [unreadMap, setUnreadMap] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user?.email) return;

    const fetchUnread = async () => {
      try {
        const res = await axios.get(`${API}/api/chat/unread/${user.email}`);
        setUnreadMap(res.data || {});
      } catch (err) {
        console.error("❌ Error fetching unread messages:", err);
      }
    };

    fetchUnread();
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;

    const s = io(SOCKET_URL, {
      withCredentials: true,
    });

    s.on("connect", () => {
      console.log(`🔌 Socket connected: ${s.id}`);
      s.emit("register", user.email);
    });

    s.on("reconnect", () => {
      console.log(`🔄 Socket reconnected: ${s.id}`);
      s.emit("register", user.email);
    });

    s.on("receiveMessage", (msg) => {
      console.log("📨 Message via socket:", msg);
      const key = `${msg.rideId}_${msg.sender}`;
      setUnreadMap((prev) => ({
        ...prev,
        [key]: (prev[key] || 0) + 1,
      }));
    });

    s.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${s.id}`);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  const clearUnread = async (rideId, participantEmail) => {
    const key = `${rideId}_${participantEmail}`;
    setUnreadMap((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

    try {
      await axios.post(`${API}/api/chat/mark-as-read`, {
        rideId,
        participantEmail,
        email: user.email,
      });
    } catch (err) {
      console.error("❌ Failed to mark messages as read:", err);
    }
  };

  return (
    <ChatContext.Provider value={{ socket, unreadMap, clearUnread }}>
      {children}
    </ChatContext.Provider>
  );
};
