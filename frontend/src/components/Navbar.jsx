import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/auth";

function Icon({ name, size = 18 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></>,
    community: <><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.7-3 2.6-4.5 5.5-4.5s4.8 1.5 5.5 4.5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.8c2.8-.5 4.7.9 5.3 3.7"/></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
    officer: <><path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z"/><path d="m9.5 12 1.7 1.7 3.6-4"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    logout: <><path d="M10 5H5v14h5"/><path d="M14 8l4 4-4 4"/><path d="M18 12H9"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6"/></>,
  };

  return <svg {...props}>{icons[name]}</svg>;
}

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const storedUser = localStorage.getItem("user");

  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const isOfficer = user?.role === "admin";
  const displayName = user?.email ? user.email.split("@")[0] : "Citizen";

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log(error);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navClass = ({ isActive }) => isActive ? "nav-item active" : "nav-item";

  return (
    <header className="site-header civic-topbar sober-header">
      <nav className="navbar civic-navbar sober-navbar">
        <Link to="/" className="navbar-brand" aria-label="CivicConnect home">
          <div className="navbar-logo civic-logo sober-logo"><span>C</span></div>
          <div className="brand-copy sober-brand-copy">
            <strong>CivicConnect</strong>
            <small>{isOfficer ? "Municipal Officer Portal" : "Citizen Service Portal"}</small>
          </div>
        </Link>

        <div className="navbar-center civic-nav-links sober-nav-links">
          <NavLink to="/" className={navClass}>
            <Icon name="home" size={17} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/complaints" className={navClass}>
            <Icon name="community" size={17} />
            <span>Community Feed</span>
          </NavLink>
          {token && !isOfficer && (
            <NavLink to="/dashboard" className={navClass}>
              <Icon name="dashboard" size={17} />
              <span>My Dashboard</span>
            </NavLink>
          )}
          {token && isOfficer && (
            <NavLink to="/officer/dashboard" className={navClass}>
              <Icon name="officer" size={17} />
              <span>Officer Dashboard</span>
            </NavLink>
          )}
        </div>

        <div className="navbar-right sober-navbar-right">
          {!token ? (
            <>
              <Link to="/login" className="navbar-link sober-signin">Sign in</Link>
              <Link to="/register" className="nav-cta">Create account</Link>
            </>
          ) : (
            <>
              {!isOfficer && (
                <Link to="/complaints/new" className="nav-cta report-cta sober-report-cta">
                  <Icon name="plus" size={16} />
                  <span>Report Issue</span>
                </Link>
              )}

              <div className="nav-account sober-account" title={user?.email || "Signed in"}>
                <span className="nav-avatar"><Icon name={isOfficer ? "officer" : "user"} size={17} /></span>
                <span className="nav-account-copy">
                  <strong>{displayName}</strong>
                  <small>{isOfficer ? "Officer" : "Citizen"}</small>
                </span>
              </div>

              <button className="logout-button sober-logout" onClick={handleLogout} aria-label="Logout">
                <Icon name="logout" size={16} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
