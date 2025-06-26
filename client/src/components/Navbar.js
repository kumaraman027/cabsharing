import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { Menu, X, User } from "lucide-react";
import axios from "axios";
import "../components/Navbar.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { unreadMap } = useContext(ChatContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [chatTotalUnread, setChatTotalUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu and profile on route change
  useEffect(() => {
    setProfileOpen(false);
    setMenuOpen(false);
  }, [location]);

  // Fetch ride join notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.email) return setUnreadCount(0);
      try {
        const res = await axios.get(`${API}/api/join/owner/${user.email}`);
        const unread = res.data.filter((req) => !req.seen).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // Update chat unread badge
  useEffect(() => {
    const total = Object.values(unreadMap).reduce((sum, count) => sum + count, 0);
    setChatTotalUnread(total);
  }, [unreadMap]);

  // Clear badge on "My Rides" page
  useEffect(() => {
    if (location.pathname === "/joined-rides") setChatTotalUnread(0);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-name">
          CabClique
        </Link>

        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" />}
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Home
          </Link>

          <Link
            to="/post-ride"
            className={location.pathname === "/post-ride" ? "active" : ""}
          >
            Post Ride
          </Link>

          <Link
            to="/view-rides"
            className={location.pathname === "/view-rides" ? "active" : ""}
          >
            View Rides
          </Link>

          <Link
            to="/joined-rides"
            className={`relative ${location.pathname === "/joined-rides" ? "active" : ""}`}
          >
            My Rides
            {chatTotalUnread > 0 && <span className="badge">+{chatTotalUnread}</span>}
          </Link>

          {user && (
            <Link
              to="/join-requests"
              className={`relative ${location.pathname === "/join-requests" ? "active" : ""}`}
            >
              Notifications🔔
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </Link>
          )}

          {user ? (
            <div className="profile-dropdown" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="profile-btn"
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <User size={20} className="inline-block mr-1" />
                {user.name?.split(" ")[0]}
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  <p><strong>{user.name}</strong></p>
                  <p className="profile-email">{user.email}</p>
                  <hr />
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={location.pathname === "/login" ? "active" : ""}>
                Login
              </Link>
              <Link to="/signup" className={location.pathname === "/signup" ? "active" : ""}>
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
