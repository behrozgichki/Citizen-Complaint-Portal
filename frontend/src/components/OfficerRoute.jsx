import { Navigate } from "react-router-dom";

function OfficerRoute({ children }) {
  const token =
    localStorage.getItem("accessToken");

  const storedUser =
    localStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(storedUser);

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default OfficerRoute;