import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  
  // Track if the mobile menu is open
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false); // Close menu on logout
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={token ? "/dashboard" : "/login"} className="brand" onClick={closeMenu}>
          <span className="brand-mark">K</span>
          Kalashree Admin
          <span className="admin-tag">Console</span>
        </Link>
        
        {/* Only show the hamburger and navigation if the admin is logged in */}
        {token && (
          <>
            {/* Hamburger Icon (Visible only on mobile) */}
            <button 
              className="hamburger" 
              onClick={toggleMenu} 
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? "✖" : "☰"}
            </button>

            {/* Nav Links Container */}
            <nav className={`nav-links ${isMenuOpen ? "open" : ""}`}>
              <NavLink to="/dashboard" className="nav-link" end onClick={closeMenu}>
                Overview
              </NavLink>
              <NavLink to="/students" className="nav-link" onClick={closeMenu}>
                Students
              </NavLink>
              <NavLink to="/fees" className="nav-link" onClick={closeMenu}>
                Fees
              </NavLink>
              <button className="btn btn-outline btn-sm text-center" onClick={handleLogout}>
                Logout
              </button>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}