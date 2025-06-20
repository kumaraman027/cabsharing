import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

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
    if (!time) newErrors.time = "Timing is required.";
    if (!rideType) newErrors.rideType = "Please select ride type.";
    if (seats < 1 || seats > 10)
      newErrors.seats = "Seats must be between 1 and 10.";
    if (!fare || isNaN(fare) || Number(fare) <= 0)
      newErrors.fare = "Fare must be a positive number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("You must be logged in to post a ride.");
      return;
    }

    if (!validate()) {
      setMessage("Please fix the errors in the form.");
      return;
    }

    try {
      
await axios.post("http://localhost:5000/api/ride/post", {
  from,
  to,
  date,
  time,
  seats,
  fare,
  rideType,
  userEmail: user.email,
});


      setMessage("Ride posted successfully!");
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
      setMessage("Failed to post ride. Please try again.");
    }
  };

  return (
   <div className="max-w-4xl mx-auto mt-10 p-10 bg-white rounded-2xl shadow-xl ring-1 ring-gray-200">

      <h2 className="text-3xl font-extrabold mb-10 text-center text-white">
  Post a Ride
</h2>


     <form
  onSubmit={handleSubmit}
  className="space-y-6 p-6 rounded-xl shadow-xl text-white"
  style={{ background: "linear-gradient(145deg, #255789, #6170a4)" }}
>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Starting Point"
            className={`w-full border px-4 py-2 rounded ${
              errors.from ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.from && <p className="text-red-600 text-sm">{errors.from}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Destination"
            className={`w-full border px-4 py-2 rounded ${
              errors.to ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.to && <p className="text-red-600 text-sm">{errors.to}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full border px-4 py-2 rounded ${
              errors.date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.date && <p className="text-red-600 text-sm">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`w-full border px-4 py-2 rounded ${
              errors.time ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.time && <p className="text-red-600 text-sm">{errors.time}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ride Type</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="rideType"
                value="Auto"
                checked={rideType === "Auto"}
                onChange={(e) => setRideType(e.target.value)}
              />
              Auto
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="rideType"
                value="Cab"
                checked={rideType === "Cab"}
                onChange={(e) => setRideType(e.target.value)}
              />
              Cab
            </label>
          </div>
          {errors.rideType && <p className="text-red-600 text-sm">{errors.rideType}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
          <input
            type="number"
            value={seats}
            min={1}
            max={10}
            onChange={(e) => setSeats(Number(e.target.value))}
            className={`w-full border px-4 py-2 rounded ${
              errors.seats ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.seats && <p className="text-red-600 text-sm">{errors.seats}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fare (₹)</label>
          <input
            type="number"
            value={fare}
            onChange={(e) => setFare(e.target.value)}
            className={`w-full border px-4 py-2 rounded ${
              errors.fare ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.fare && <p className="text-red-600 text-sm">{errors.fare}</p>}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full py-3 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
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
