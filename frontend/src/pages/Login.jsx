import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/auth";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(
        email,
        password
      );

      localStorage.setItem(
        "accessToken",
        data.accessToken
      );

      navigate("/dashboard");
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

          <div className="brand-icon">
            A
          </div>

          <h1>Welcome back</h1>

          <p>
            Sign in to continue to AuthFlow
          </p>

        </div>

        <div className="auth-card">

          <h2>Sign in</h2>

          <p className="auth-description">
            Enter your credentials to access
            your account.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
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
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

          <div className="auth-footer">

            Don't have an account?{" "}

            <button
              className="auth-link"
              style={{
                border: "none",
                background: "transparent",
              }}
              onClick={() =>
                navigate("/register")
              }
            >
              Create account
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;