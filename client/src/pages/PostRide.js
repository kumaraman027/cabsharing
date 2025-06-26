import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function PostRide() {
  const { user } = useContext(AuthContext);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [fare, setFare] = useState("");
  const [rideType, setRideType] = useState("Auto");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!from.trim()) newErrors.from = "Starting point is required.";
    if (!to.trim()) newErrors.to = "Destination is required.";
    if (!date) newErrors.date = "Date is required.";
    if (!time) newErrors.time = "Time is required.";
    if (!rideType) newErrors.rideType = "Please select ride type.";
    if (seats < 1 || seats > 10) newErrors.seats = "Seats must be between 1 and 10.";
    if (!fare || isNaN(fare) || Number(fare) <= 0) newErrors.fare = "Fare must be a positive number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("You must be logged in to post a ride.");
      return;
    }

    if (!validate()) {
      setMessage("Please fix the errors above.");
      return;
    }

    try {
      await axios.post(`${API}/api/ride/post`, {
        from,
        to,
        date,
        time,
        seats,
        fare,
        rideType,
        userEmail: user.email,
      });

      setMessage("✅ Ride posted successfully!");
      setErrors({});
      setFrom("");
      setTo("");
      setDate("");
      setTime("");
      setSeats(1);
      setFare("");
      setRideType("Auto");
    } catch (err) {
      console.error("Ride post error:", err);
      setMessage("❌ Failed to post ride. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl ring-1 ring-gray-200">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">Post a Ride</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-6 rounded-xl text-white"
        style={{ background: "linear-gradient(145deg, #255789, #6170a4)" }}
      >
        {/* From Location */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">From</label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Starting Point"
            className={`w-full px-4 py-2 rounded border ${errors.from ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.from && <p className="text-red-300 text-sm mt-1">{errors.from}</p>}
        </div>

        {/* To Location */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">To</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Destination"
            className={`w-full px-4 py-2 rounded border ${errors.to ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.to && <p className="text-red-300 text-sm mt-1">{errors.to}</p>}
        </div>

        {/* Date & Time */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-200 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-2 rounded border ${errors.date ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.date && <p className="text-red-300 text-sm mt-1">{errors.date}</p>}
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-200 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`w-full px-4 py-2 rounded border ${errors.time ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.time && <p className="text-red-300 text-sm mt-1">{errors.time}</p>}
          </div>
        </div>

        {/* Ride Type */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Ride Type</label>
          <div className="flex gap-6 mt-1">
            {["Auto", "Cab"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rideType"
                  value={type}
                  checked={rideType === type}
                  onChange={(e) => setRideType(e.target.value)}
                />
                {type}
              </label>
            ))}
          </div>
          {errors.rideType && <p className="text-red-300 text-sm mt-1">{errors.rideType}</p>}
        </div>

        {/* Seats & Fare */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-200 mb-1">Seats</label>
            <input
              type="number"
              value={seats}
              min={1}
              max={10}
              onChange={(e) => setSeats(Number(e.target.value))}
              className={`w-full px-4 py-2 rounded border ${errors.seats ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.seats && <p className="text-red-300 text-sm mt-1">{errors.seats}</p>}
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-200 mb-1">Fare (₹)</label>
            <input
              type="number"
              value={fare}
              onChange={(e) => setFare(e.target.value)}
              className={`w-full px-4 py-2 rounded border ${errors.fare ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.fare && <p className="text-red-300 text-sm mt-1">{errors.fare}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full py-3 rounded-md bg-indigo-600 hover:bg-indigo-700 transition font-semibold"
          >
            Post Ride
          </button>
        </div>
      </form>

      {message && (
        <p className={`mt-6 text-center text-sm font-medium ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
