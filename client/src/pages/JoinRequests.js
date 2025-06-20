import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import './JoinRequests.css';

export default function JoinRequests() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.email) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/join/owner/${user.email}`);
        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching join requests:", err);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 5000); // refresh every 5s

    return () => clearInterval(interval);
  }, [user]);

  const handleAccept = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/join/${id}/accept`);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, accepted: 1, seen: 1 } : req
        )
      );
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/join/${id}/reject`);
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, accepted: 0, seen: 1 } : req
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
        {requests.map((req, index) => (
          <li key={index} className="request-item">
            <p className="request-info">
              <strong>{req.requester_email}</strong> wants to join your ride from{" "}
              <strong>{req.from_location}</strong> to{" "}
              <strong>{req.to_location}</strong>
            </p>
            <p className="request-time">
              Requested At: {new Date(req.joined_at).toLocaleString()}
            </p>

            {req.accepted === 1 && (
              <div className="button-group">
                <p className="request-status status-accepted">Accepted </p>
                
              </div>
            )}

            {req.accepted === 0 && (
              <p className="request-status status-rejected">Rejected ❌</p>
            )}

            {req.accepted === null && (
              <div className="button-group">
                <button
                  onClick={() => handleAccept(req.id)}
                  className="button-accept"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(req.id)}
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
