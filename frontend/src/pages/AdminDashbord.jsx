import { useEffect, useState } from "react";
import {
  getUsers,
  deleteUser,
  updateUserRole,
} from "../services/admin";
import '../styles/admin.css'

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await getUsers();

      setUsers(response.data);
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(id);

      setUsers((previousUsers) =>
        previousUsers.filter(
          (user) => user._id !== id
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };


  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === id
            ? { ...user, role }
            : user
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };


  const totalUsers = users.length;

  const totalAdmins = users.filter(
    (user) => user.role === "admin"
  ).length;

  const regularUsers = users.filter(
    (user) => user.role === "user"
  ).length;


  if (loading) {
    return (
      <div className="admin-loading">
        Loading dashboard...
      </div>
    );
  }


  return (
    <div className="admin-dashboard">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="logo">
          Auth<span>Admin</span>
        </div>

        <nav>
          <a className="active">
            Dashboard
          </a>

          <a>
            Users
          </a>
        </nav>

        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>

      </aside>


      {/* Main */}

      <main className="admin-main">

        <header className="admin-header">

          <div>
            <p>Welcome back</p>

            <h1>Admin Dashboard</h1>
          </div>

          <div className="admin-profile">
            <div className="avatar">
              A
            </div>

            <div>
              <strong>Administrator</strong>
              <small>Admin</small>
            </div>
          </div>

        </header>


        {/* Statistics */}

        <section className="stats">

          <div className="stat-card">
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
          </div>

          <div className="stat-card">
            <span>Administrators</span>
            <strong>{totalAdmins}</strong>
          </div>

          <div className="stat-card">
            <span>Regular Users</span>
            <strong>{regularUsers}</strong>
          </div>

        </section>


        {/* User management */}

        <section className="users-section">

          <div className="section-header">

            <div>
              <h2>User Management</h2>

              <p>
                Manage accounts and permissions
              </p>
            </div>

            <button onClick={loadUsers}>
              Refresh
            </button>

          </div>


          {error && (
            <div className="error">
              {error}
            </div>
          )}


          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {users.map((user) => (

                  <tr key={user._id}>

                    <td>

                      <div className="user-info">

                        <div className="user-avatar">
                          {user.email
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {user.email}
                          </strong>

                          <small>
                            ID: {user._id}
                          </small>
                        </div>

                      </div>

                    </td>


                    <td>

                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user._id,
                            e.target.value
                          )
                        }
                      >

                        <option value="user">
                          User
                        </option>

                        <option value="admin">
                          Admin
                        </option>

                      </select>

                    </td>


                    <td>
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>


                    <td>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(user._id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;