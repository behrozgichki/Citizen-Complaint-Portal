import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/auth";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  const handleLogout = async () => {
    try {
      await logoutUser();

      localStorage.removeItem("accessToken");

      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">
          A
        </div>

        <span>AuthFlow</span>
      </Link>

      <div className="navbar-right">
        {!token ? (
          <>
            <Link
              to="/login"
              className="navbar-link"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="navbar-link"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              className="navbar-link"
            >
              Dashboard
            </Link>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;