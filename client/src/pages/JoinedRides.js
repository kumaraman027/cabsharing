import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./JoinedRides.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function JoinedRides() {
  const { user } = useContext(AuthContext);
  const { unreadMap } = useContext(ChatContext);
  const [joined, setJoined] = useState([]);
  const [postedAccepted, setPostedAccepted] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      fetchJoinedByUser(user.email);
      fetchAcceptedForMyRides(user.email);
    }
  }, [user]);

  const fetchJoinedByUser = async (email) => {
    try {
      const res = await axios.get(`${API}/api/join/user/${email}`);
      setJoined(res.data || []);
    } catch (err) {
      console.error("Error fetching joined rides:", err);
    }
  };

  const fetchAcceptedForMyRides = async (email) => {
    try {
      const res = await axios.get(`${API}/api/join/accepted-by-owner/${email}`);
      setPostedAccepted(res.data || []);
    } catch (err) {
      console.error("Error fetching riders joined my rides:", err);
    }
  };

  const getBadge = (rideId, email) => {
    const key = `${rideId}_${email}`;
    const count = unreadMap[key] || 0;
    return count > 0 ? <span className="chat-badge">+{count}</span> : null;
  };

  return (
    <div className="joined-rides-container">
      <h2 className="joined-rides-title">My Join Requests</h2>

      {joined.length === 0 ? (
        <p className="text-center text-gray-500">No join requests sent yet.</p>
      ) : (
        joined.map((ride, index) => (
          <div className="joined-ride-box" key={ride._id || index}>
            <div className="ride-header">
              {ride.from_location || "Unknown"} → {ride.to_location || "Unknown"}
            </div>
            <div className="ride-date">
              You requested on: {new Date(ride.joined_at).toLocaleString()}
            </div>
            <div className="ride-footer">
              <div className="ride-status">
                {ride.accepted === true
                  ? "Accepted"
                  : ride.accepted === false
                  ? "Rejected"
                  : "Pending"}
              </div>

              {(ride.accepted === true || ride.accepted === 1) && (
                <button
                  className="chat-button"
                  onClick={() =>
                    navigate(`/chat/${ride.ride_id}/${ride.owner_email}`)
                  }
                >
                  Chat 💬 {getBadge(ride.ride_id, ride.owner_email)}
                </button>
              )}
            </div>
          </div>
        ))
      )}

      <h2 className="joined-rides-title" style={{ marginTop: "2rem" }}>
        Riders Joined Your Rides
      </h2>

      {postedAccepted.length === 0 ? (
        <p className="text-center text-gray-500">No accepted join requests for your rides.</p>
      ) : (
        postedAccepted.map((req, index) => (
          <div className="joined-ride-box" key={req._id || `owner-${index}`}>
            <div className="ride-header">
              {req.from_location || "Unknown"} → {req.to_location || "Unknown"}
            </div>
            <div className="ride-date">
              {req.requester_name} joined on:{" "}
              {req.joined_at
                ? new Date(req.joined_at).toLocaleString()
                : "Unknown"}
            </div>
            <div className="ride-footer">
              <div className="ride-status">Accepted</div>
              <button
                className="chat-button"
                onClick={() =>
                  navigate(`/chat/${req.ride_id}/${req.requester_email}`)
                }
              >
                Chat 💬 {getBadge(req.ride_id, req.requester_email)}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
