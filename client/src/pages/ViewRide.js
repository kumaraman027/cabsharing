import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function ViewRide() {
  const [rides, setRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);
  const [joinedRideIds, setJoinedRideIds] = useState([]);
  const [rideJoinCounts, setRideJoinCounts] = useState({});

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/ride/all");
        const today = new Date();

        const filtered = res.data.filter((r) => {
          if (!r.date || !r.from_location || !r.to_location) return false;
          const rideDate = new Date(r.date);
          return rideDate >= today;
        });

        setRides(filtered);
      } catch (err) {
        console.error("Error fetching rides:", err);
      }
    };

    const fetchJoinedRequests = async () => {
      if (!user?.email) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/join/user/${user.email}`);
        const joined = res.data.map((req) => req.ride_id);
        setJoinedRideIds(joined);
      } catch (err) {
        console.error("Error fetching joined requests:", err);
      }
    };

    const fetchJoinCounts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/join/all");
        const counts = {};

        res.data.forEach((join) => {
          if (join.accepted === 1) {
            counts[join.ride_id] = (counts[join.ride_id] || 0) + 1;
          }
        });

        setRideJoinCounts(counts);
      } catch (err) {
        console.error("Error fetching join counts:", err);
      }
    };

    fetchRides();
    fetchJoinedRequests();
    fetchJoinCounts();
  }, [user]);

  const handleJoinRide = async (ride) => {
    if (!user) {
      alert("Please login first.");
      return;
    }

    const rideId = ride.ride_id || ride.id;

    try {
      await axios.post("http://localhost:5000/api/join", {
        ride_id: rideId,
        requester_name: user.name,
        requester_email: user.email,
        owner_email: ride.user_email,
        from_location: ride.from_location,
        to_location: ride.to_location,
      });

      setJoinedRideIds((prev) => [...prev, rideId]);
      alert("Join request sent!");
    } catch (err) {
      console.error("Error sending join request:", err);
      alert("Failed to send join request.");
    }
  };

  const filteredRides = rides.filter((ride) => {
    const term = searchTerm.toLowerCase();
    return (
      (ride.from_location || "").toLowerCase().includes(term) ||
      (ride.to_location || "").toLowerCase().includes(term) ||
      (ride.date || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="viewride-container">
      <h2 className="viewride-title">Available Rides</h2>

      {user && (
        <p className="logged-in-user">
          Logged in as: <strong>{user.name}</strong>
        </p>
      )}

      <input
        type="text"
        placeholder="Search by From, To or Date (YYYY-MM-DD)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="viewride-search"
      />

      {filteredRides.length === 0 ? (
        <p className="no-rides-message">No rides found.</p>
      ) : (
        <ul className="ride-list">
          {filteredRides.map((ride) => {
            const rideId = ride.ride_id || ride.id;
            const isOwnRide = user && ride.user_email?.toLowerCase() === user.email?.toLowerCase();
            const alreadyJoined = joinedRideIds.includes(rideId);
            const joinedCount = rideJoinCounts[rideId] || 0;
            const seatsLeft = (ride.available_seats || ride.seats) - joinedCount;

            return (
              <li key={rideId} className="ride-card">
                <div className="ride-header">
                  <div>{ride.from_location} → {ride.to_location}</div>
                  <div className="ride-date">
                    {ride.date?.slice(0, 10)} {ride.time?.slice(0, 5)}
                  </div>
                </div>

                <div className="ride-details">
                  <div>Seats Left: {seatsLeft > 0 ? seatsLeft : "Full"}</div>
                  <div>Fare: ₹{ride.fare} per person</div>
                  <div>Posted by: <span className="ride-poster">{ride.user_email}</span></div>
                  {isOwnRide && (
                    <p className="text-indigo-600 text-sm mt-1">This is your ride</p>
                  )}
                </div>

                {user && !isOwnRide && seatsLeft > 0 && (
                  <button
                    onClick={() => handleJoinRide(ride)}
                    className="join-ride-btn"
                    disabled={alreadyJoined}
                    style={{
                      backgroundColor: alreadyJoined ? "#ccc" : "#1e90ff",
                      cursor: alreadyJoined ? "not-allowed" : "pointer",
                    }}
                  >
                    {alreadyJoined ? "Already Joined" : "Join Ride"}
                  </button>
                )}

                {!isOwnRide && seatsLeft <= 0 && (
                  <p className="text-red-600 font-semibold text-center mt-2">No Seats Left</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
