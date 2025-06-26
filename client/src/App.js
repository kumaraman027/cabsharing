import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PostRide from "./pages/PostRide";
import ViewRide from "./pages/ViewRide";
import JoinedRides from "./pages/JoinedRides";
import JoinRequests from "./pages/JoinRequests";
import Chat from "./pages/Chat";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// ✅ Only initialize ChatProvider after user is loaded
function AppContent() {
  const { user, loading } = useContext(AuthContext); // you may need to add `loading` logic if not yet

  if (loading) return <div className="text-center mt-10">Loading...</div>; // Optional loading state

  return (
    <ChatProvider user={user}>
      <Router>
        <Navbar />
        <div className="main-content p-5">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/post-ride" element={<PostRide />} />
            <Route path="/view-rides" element={<ViewRide />} />
            <Route path="/joined-rides" element={<JoinedRides />} />
            <Route path="/join-requests" element={<JoinRequests />} />
            <Route path="/chat/:rideId/:participantEmail" element={<Chat />} />
          </Routes>
        </div>
      </Router>
    </ChatProvider>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
