import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "./JoinRequests.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function JoinRequests() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.email) return;
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/join/owner/${user.email}`
        );
        const pendingRequests = res.data.filter((req) => req.accepted === null);
        setRequests(pendingRequests);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleAccept = async (_id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/join/${_id}/accept`);
      setRequests((prev) =>
        prev.map((r) => (r._id === _id ? { ...r, accepted: 1, seen: 1 } : r))
      );
      alert("✅ Join request accepted.");
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleReject = async (_id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/join/${_id}/reject`);
      setRequests((prev) =>
        prev.map((r) => (r._id === _id ? { ...r, accepted: 0, seen: 1 } : r))
      );
      alert("❌ Join request rejected.");
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  if (!user?.email) {
    return (
      <div className="p-6 text-center text-gray-700">
        Please login to view your ride join requests.
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No join requests at the moment.
      </div>
    );
  }

  return (
    <div className="join-requests-container">
      <h2 className="join-requests-title">Ride Join Requests</h2>
      <ul className="space-y-4">
        {requests.map((req) => (
          <li key={req._id} className="request-item">
            <p className="request-info">
              <strong>{req.requester_name || req.requester_email}</strong> wants to join your ride from{" "}
              <strong>{req.from_location}</strong> to{" "}
              <strong>{req.to_location}</strong>.
            </p>
            <p className="request-time">
              Requested At:{" "}
              {new Date(req.joined_at).toLocaleString("en-IN", {
                hour12: true,
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {req.accepted === null && (
              <div className="button-group">
                <button onClick={() => handleAccept(req._id)} className="button-accept">
                  Accept
                </button>
                <button onClick={() => handleReject(req._id)} className="button-reject">
                  Reject
                </button>
              </div>
            )}

            {req.accepted === 1 && (
              <p className="request-status status-accepted">✅ Accepted</p>
            )}
            {req.accepted === 0 && (
              <p className="request-status status-rejected">❌ Rejected</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
