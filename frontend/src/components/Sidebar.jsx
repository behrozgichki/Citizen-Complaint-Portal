import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-title">
        Workspace
      </div>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `sidebar-item ${
            isActive ? "active" : ""
          }`
        }
      >
        <span>▦</span>
        Dashboard
      </NavLink>

      <NavLink
        to="/dashboard"
        className="sidebar-item"
      >
        <span>◉</span>
        Profile
      </NavLink>

      <NavLink
        to="/dashboard"
        className="sidebar-item"
      >
        <span>⚙</span>
        Settings
      </NavLink>

    </aside>
  );
}

export default Sidebar;