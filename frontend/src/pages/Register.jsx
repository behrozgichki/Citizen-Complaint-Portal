import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../services/auth";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser(
        email,
        password
      );

      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        <div className="auth-brand">

          <div className="brand-icon">CC</div>

          <h1>Create your account</h1>

          <p>
            Join your local CivicConnect community
          </p>

        </div>

        <div className="auth-card">

          <h2>Get started</h2>

          <p className="auth-description">
            Create your citizen account to report and track civic issues.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>

            <div className="form-group">

              <label>
                Email address
              </label>

              <div className="input-wrapper">

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

            </div>

            <div className="form-group">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  minLength={6}
                  required
                />

              </div>

            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

          <div className="auth-footer">

            Already have an account?{" "}

            <button
              className="auth-link"
              style={{
                border: "none",
                background: "transparent",
              }}
              onClick={() =>
                navigate("/login")
              }
            >
              Sign in
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;