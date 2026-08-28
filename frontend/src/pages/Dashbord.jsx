import { useEffect, useState } from "react";

import { getProfile } from "../services/auth";

import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setUser(data.user);
      } catch (error) {
        console.log(
          "Profile error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-content">

        <div className="dashboard-header">

          <div>
            <h1>Dashboard</h1>

            <p>
              Here's what's happening with
              your account.
            </p>
          </div>

          <div className="avatar">
            {user?.email
              ?.charAt(0)
              .toUpperCase()}
          </div>

        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon">
                👤
              </div>

            </div>

            <span>
              Account
            </span>

            <h3>
              Active
            </h3>

          </div>

          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon">
                🔐
              </div>

            </div>

            <span>
              Authentication
            </span>

            <h3>
              Secure
            </h3>

          </div>

          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon">
                ✓
              </div>

            </div>

            <span>
              Status
            </span>

            <h3>
              Verified
            </h3>

          </div>

        </div>

        <div className="content-grid">

          <div className="dashboard-card">

            <div className="dashboard-card-header">

              <h2>
                Account information
              </h2>

              <span>
                Profile
              </span>

            </div>

            <div className="profile-row">

              <div className="profile-row-label">
                Email
              </div>

              <div className="profile-row-value">
                {user?.email}
              </div>

            </div>

            <div className="profile-row">

              <div className="profile-row-label">
                User ID
              </div>

              <div className="profile-row-value">
                {user?._id}
              </div>

            </div>

            <div className="profile-row">

              <div className="profile-row-label">
                Status
              </div>

              <div>
                <span className="status-badge">
                  <span className="status-dot"></span>
                  Active
                </span>
              </div>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="dashboard-card-header">

              <h2>
                Security
              </h2>

            </div>

            <div className="profile-row">

              <div className="profile-row-label">
                Session
              </div>

              <div className="profile-row-value">
                Protected
              </div>

            </div>

            <div className="profile-row">

              <div className="profile-row-label">
                JWT
              </div>

              <div>
                <span className="status-badge">
                  <span className="status-dot"></span>
                  Valid
                </span>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;