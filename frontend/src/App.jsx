import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashbord";
import AdminDashboard from "./pages/AdminDashbord";
import ProtectedRoute from "./components/ProctectedRoutes";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={
            <div
              style={{
                padding: "60px",
                textAlign: "center",
              }}
            >
              <h1>
                Welcome to AuthFlow
              </h1>

              <p
                style={{
                  marginTop: "10px",
                  color: "#64748b",
                }}
              >
                Secure authentication made simple.
              </p>
            </div>
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
          
        />
        <Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;