import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={token ? "/dashboard" : "/login"} className="brand">
          <span className="brand-mark">K</span>
          Kalashree Admin
          <span className="admin-tag">Console</span>
        </Link>
        {token && (
          <nav className="nav-links">
            <NavLink to="/dashboard" className="nav-link" end>Overview</NavLink>
            <NavLink to="/students" className="nav-link">Students</NavLink>
            <NavLink to="/fees" className="nav-link">Fees</NavLink>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </nav>
        )}
      </div>
    </header>
  );
}
