import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import './JoinRequests.css';

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function JoinRequests() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.email) return;
      try {
        const res = await axios.get(`${API}/api/join/owner/${user.email}`);
        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching join requests:", err);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleAccept = async (_id) => {
    try {
      await axios.put(`${API}/api/join/${_id}/accept`);
      setRequests((prev) =>
        prev.map((req) =>
          req._id === _id ? { ...req, accepted: true, seen: true } : req
        )
      );
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleReject = async (_id) => {
    try {
      await axios.put(`${API}/api/join/${_id}/reject`);
      setRequests((prev) =>
        prev.map((req) =>
          req._id === _id ? { ...req, accepted: false, seen: true } : req
        )
      );
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  if (!user || !user.email) {
    return <p className="p-6 text-center">Please login to see join requests.</p>;
  }

  if (requests.length === 0) {
    return <p className="p-6 text-center">No join requests at the moment.</p>;
  }

  return (
    <div className="join-requests-container">
      <h2 className="join-requests-title">Notifications</h2>
      <ul className="space-y-4">
        {requests.map((req) => (
          <li key={req._id} className="request-item">
            <p className="request-info">
              <strong>{req.requester_email}</strong> wants to join your ride from{" "}
              <strong>{req.from_location}</strong> to{" "}
              <strong>{req.to_location}</strong>.
            </p>
            <p className="request-time">
              Requested At: {new Date(req.joined_at).toLocaleString()}
            </p>

            {req.accepted === true && (
              <p className="request-status status-accepted">✅ Accepted</p>
            )}

            {req.accepted === false && (
              <p className="request-status status-rejected">❌ Rejected</p>
            )}

            {req.accepted === null && (
              <div className="button-group">
                <button
                  onClick={() => handleAccept(req._id)}
                  className="button-accept"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(req._id)}
                  className="button-reject"
                >
                  Reject
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
