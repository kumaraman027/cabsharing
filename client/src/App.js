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
import './index.css'; // Or App.css where Tailwind is imported



// Inside your <Routes> component



import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext"; // ✅ import ChatProvider
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// ✅ Wrap App content in ChatProvider if user is available
function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <ChatProvider user={user}>
      <Router>
        <Navbar />
        <div className="main-content" style={{ padding: "20px" }}>
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
