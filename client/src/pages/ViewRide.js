import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function ViewRide() {
  const [rides, setRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);
  const [joinedRideIds, setJoinedRideIds] = useState([]);
  const [rideJoinCounts, setRideJoinCounts] = useState({});

  const fetchRides = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ride/all");
      const todayStr = new Date().toISOString().split("T")[0];
      const filtered = res.data.filter((r) => r.date && r.date >= todayStr);
      setRides(filtered);
    } catch (err) {
      console.error("Error fetching rides:", err);
    }
  };

  const fetchJoinedRequests = async () => {
    if (!user?.email) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/join/user/${user.email}`);
      const joined = res.data.map((req) => req.rideId?.toString());
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
        if (join.accepted === 1 || join.accepted === true) {
          const id = join.rideId?.toString();
          counts[id] = (counts[id] || 0) + 1;
        }
      });
      setRideJoinCounts(counts);
    } catch (err) {
      console.error("Error fetching join counts:", err);
    }
  };

  useEffect(() => {
    fetchRides();
    fetchJoinedRequests();
    fetchJoinCounts();

    const interval = setInterval(() => {
      fetchRides();
      fetchJoinCounts();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleJoinRide = async (ride) => {
    if (!user) return alert("Please login first.");
    const rideId = (ride._id || ride.ride_id || ride.id)?.toString();

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
      setRideJoinCounts((prev) => ({
        ...prev,
        [rideId]: (prev[rideId] || 0) + 1,
      }));

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
  <div className="viewride-container px-4 py-10 bg-[#0b1f33] min-h-screen">
    <h2 className="text-3xl font-bold text-center mb-8 text-white">Available Rides</h2>

    {user && (
      <p className="text-center text-gray-300 mb-6">
        Logged in as: <strong>{user.name}</strong>
      </p>
    )}

    <div className="flex justify-center mb-6">
      <input
        type="text"
        placeholder="Search by From, To or Date (YYYY-MM-DD)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-4 py-2 border border-gray-400 rounded-lg w-full max-w-md shadow-md text-black"
      />
    </div>

    {filteredRides.length === 0 ? (
      <p className="text-center text-gray-400">No rides found.</p>
    ) : (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredRides.map((ride) => {
          const rideId = (ride._id || ride.ride_id || ride.id)?.toString();
          const isOwnRide =
            user && ride.user_email?.toLowerCase() === user.email?.toLowerCase();
          const alreadyJoined = joinedRideIds.includes(rideId);
          const joinedCount = rideJoinCounts[rideId] || 0;
          const totalSeats = ride.available_seats || ride.seats || 0;
          const seatsLeft = totalSeats - joinedCount;

          return (
            <div key={rideId} className="ride-card">
              <div className="ride-header">
                <span>{ride.from_location} → {ride.to_location}</span>
                <span className="ride-date">
                  {ride.date?.slice(0, 10)} {ride.time?.slice(0, 5)}
                </span>
              </div>

              <div className="ride-details">
                <div><strong>Fare:</strong> ₹{ride.fare}</div>
                <div>
                  <strong>Seats Left:</strong>{" "}
                  {seatsLeft > 0 ? (
                    <span style={{ color: "#7fff9f" }}>{seatsLeft}</span>
                  ) : (
                    <span style={{ color: "#ff8080" }}>Full</span>
                  )}
                </div>
              </div>

              <div className="ride-details">
                <div className="ride-poster">
                  <strong>Posted by:</strong> {ride.user_email}
                </div>
              </div>

              {isOwnRide && (
                <p className="text-sm text-blue-200 text-center mt-2">You posted this ride</p>
              )}

              {!isOwnRide && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => handleJoinRide(ride)}
                    disabled={alreadyJoined || seatsLeft === 0}
                    className="join-ride-btn"
                    style={{
                      backgroundColor: alreadyJoined ? "#6c757d" : undefined,
                      cursor: alreadyJoined ? "not-allowed" : "pointer",
                    }}
                  >
                    {alreadyJoined ? "Joined" : "Join Ride"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
);






}
