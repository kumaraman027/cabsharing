import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { Menu, X, User } from "lucide-react";
import axios from "axios";
import "../components/Navbar.css";

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

  // ✅ Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Close profile dropdown on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.email) return setUnreadCount(0);
      try {
        const res = await axios.get(`http://localhost:5000/api/join/owner/${user.email}`);
        const unread = res.data.filter((req) => req.seen === 0 || req.seen === false).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const total = Object.values(unreadMap).reduce((sum, count) => sum + count, 0);
    setChatTotalUnread(total);
  }, [unreadMap]);

  useEffect(() => {
    if (location.pathname === "/joined-rides") setChatTotalUnread(0);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-name">CabClique</Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" />}
        </button>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/post-ride" onClick={() => setMenuOpen(false)}>Post Ride</Link>
          <Link to="/view-rides" onClick={() => setMenuOpen(false)}>View Rides</Link>

          <Link to="/joined-rides" className="relative" onClick={() => setMenuOpen(false)}>
            My Rides
            {chatTotalUnread > 0 && <span className="badge">+{chatTotalUnread}</span>}
          </Link>

          {user && (
            <Link to="/join-requests" className="relative" onClick={() => setMenuOpen(false)}>
              Notifications🔔
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </Link>
          )}

          {user ? (
            <div className="profile-dropdown" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="profile-btn">
                <User size={20} className="inline-block mr-1" />
                {user.name.split(" ")[0]}
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
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
