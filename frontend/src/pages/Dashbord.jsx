import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getComplaints, getMyComplaints } from "../services/complaints";

function Icon({ name, size = 19 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    list: <><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.5 3.7 5.5 3.7 9S14.5 18.5 12 21c-2.5-2.5-3.7-5.5-3.7-9S9.5 5.5 12 3Z"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8.2 12.2 2.5 2.5 5.3-5.4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
    vote: <><path d="M7 10v10H4V10h3Z"/><path d="M7 18h9.5a2 2 0 0 0 1.9-1.4l1.4-4.5A2 2 0 0 0 17.9 9H14l.7-3.1A2.4 2.4 0 0 0 12.4 3L7 10"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
  };
  return <svg {...props}>{icons[name]}</svg>;
}

const categories = ["Road", "Garbage", "Water", "Electricity", "Other"];

function Dashboard() {
  const storedUser = localStorage.getItem("user");
  let user = null;
  try { user = storedUser ? JSON.parse(storedUser) : null; } catch { user = null; }

  const emailName = user?.email ? user.email.split("@")[0] : "Citizen";
  const friendlyName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

  const [mine, setMine] = useState([]);
  const [community, setCommunity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mineResult, communityResult] = await Promise.allSettled([
          getMyComplaints(),
          getComplaints(),
        ]);
        if (mineResult.status === "fulfilled") setMine(mineResult.value.data || []);
        if (communityResult.status === "fulfilled") setCommunity(communityResult.value.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const pending = mine.filter((c) => c.status === "Pending").length;
    const inProgress = mine.filter((c) => c.status === "In Progress").length;
    const resolved = mine.filter((c) => c.status === "Resolved").length;
    const upvotes = mine.reduce((sum, c) => sum + Number(c.upvotes || 0), 0);
    return { total: mine.length, pending, inProgress, resolved, upvotes };
  }, [mine]);

  const categoryData = useMemo(() => {
    const source = community.length ? community : mine;
    const counts = categories.map((name) => ({
      name,
      value: source.filter((c) => c.category === name).length,
    }));
    const max = Math.max(...counts.map((x) => x.value), 1);
    return counts.map((x) => ({ ...x, percent: Math.max((x.value / max) * 100, x.value ? 10 : 0) }));
  }, [community, mine]);

  const topLocations = useMemo(() => {
    const counts = {};
    community.forEach((c) => {
      const area = c.area || "Unknown area";
      counts[area] = (counts[area] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [community]);

  const recent = mine.slice(0, 5);

  return (
    <main className="dashboard-page-v4">
      <aside className="citizen-sidebar-v4">
        <div className="sidebar-profile-v4">
          <div className="sidebar-avatar-v4">{friendlyName.charAt(0)}</div>
          <div><strong>{friendlyName}</strong><span>Citizen account</span></div>
        </div>

        <p className="sidebar-label-v4">NAVIGATION</p>
        <nav>
          <Link className="side-link-v4 active" to="/dashboard"><Icon name="dashboard" /> <span>Dashboard<small>Your civic overview</small></span></Link>
          <Link className="side-link-v4" to="/complaints/new"><Icon name="plus" /> <span>Report Complaint<small>Create a new issue</small></span></Link>
          <Link className="side-link-v4" to="/complaints/mine"><Icon name="list" /> <span>My Complaints<small>Track your reports</small></span></Link>
          <Link className="side-link-v4" to="/complaints"><Icon name="globe" /> <span>Public Complaints<small>Support community issues</small></span></Link>
        </nav>

        <div className="sidebar-help-v4">
          <span>YOUR VOICE MATTERS</span>
          <strong>Together, we build a better city.</strong>
          <p>Report clearly. Track openly. Help your community prioritize what matters.</p>
          <Link to="/complaints/new">Report an issue <Icon name="arrow" size={15} /></Link>
        </div>
      </aside>

      <section className="dashboard-main-v4">
        <div className="dashboard-toolbar-v4">
          <div>
            <span className="eyebrow">CITIZEN DASHBOARD</span>
            <h1>Welcome back, {friendlyName} 👋</h1>
            <p>Here is what is happening with your reports and your community.</p>
          </div>
          <Link to="/complaints/new" className="primary-button"><Icon name="plus" size={17} /> Report New Issue</Link>
        </div>

        <div className="dashboard-hero-v4">
          <div className="hero-copy-v4">
            <span>MAKE YOUR CITY BETTER</span>
            <h2>See a problem? Turn it into visible action.</h2>
            <p>Add the right details, photo and location. CivicConnect makes your report trackable from submission to resolution.</p>
            <div className="hero-actions-v4">
              <Link to="/complaints/new">Start a report <Icon name="arrow" size={16} /></Link>
              <Link to="/complaints">Explore community issues</Link>
            </div>
          </div>
          <div className="hero-visual-v4" aria-hidden="true">
            <div className="city-grid-v4"></div>
            <div className="hero-device-v4">
              <div className="device-head-v4"><span></span><span></span><span></span></div>
              <div className="device-body-v4">
                <i></i><i></i><i></i>
                <b></b><b></b><b></b><b></b>
              </div>
            </div>
            <div className="hero-floating-v4 one"><Icon name="check" /><span><strong>Resolved</strong><small>Officer action completed</small></span></div>
            <div className="hero-floating-v4 two"><Icon name="vote" /><span><strong>Community powered</strong><small>Upvotes influence priority</small></span></div>
          </div>
        </div>

        <div className="impact-heading-v4"><div><span>YOUR IMPACT</span><h2>Your civic activity at a glance</h2></div><small>{loading ? "Updating…" : "Live from your complaint data"}</small></div>

        <div className="dashboard-stats-v4">
          <div className="dash-stat-v4"><span className="stat-icon-v4 blue"><Icon name="list" /></span><div><small>Total Reports</small><strong>{stats.total}</strong><em>All complaints submitted</em></div></div>
          <div className="dash-stat-v4"><span className="stat-icon-v4 amber"><Icon name="clock" /></span><div><small>Pending</small><strong>{stats.pending}</strong><em>Waiting for review</em></div></div>
          <div className="dash-stat-v4"><span className="stat-icon-v4 cyan"><Icon name="clock" /></span><div><small>In Progress</small><strong>{stats.inProgress}</strong><em>Municipal team working</em></div></div>
          <div className="dash-stat-v4"><span className="stat-icon-v4 green"><Icon name="check" /></span><div><small>Resolved</small><strong>{stats.resolved}</strong><em>Successfully completed</em></div></div>
          <div className="dash-stat-v4"><span className="stat-icon-v4 red"><Icon name="vote" /></span><div><small>Upvotes Received</small><strong>{stats.upvotes}</strong><em>Community support</em></div></div>
        </div>

        <div className="dashboard-grid-v4">
          <section className="dashboard-card-v4 category-card-v4">
            <div className="card-heading-v4"><div><span>COMMUNITY SNAPSHOT</span><h3>Complaints by category</h3></div><Link to="/complaints">View all</Link></div>
            <div className="category-bars-v4">
              {categoryData.map((item) => (
                <div className="category-row-v4" key={item.name}>
                  <div><span>{item.name}</span><strong>{item.value}</strong></div>
                  <div className="bar-track-v4"><i style={{ width: `${item.percent}%` }}></i></div>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-card-v4 location-card-v4">
            <div className="card-heading-v4"><div><span>COMMUNITY HOTSPOTS</span><h3>Top reported areas</h3></div><Icon name="pin" /></div>
            <div className="locations-v4">
              {topLocations.length ? topLocations.map(([area, count], index) => (
                <div key={area}><span className={`location-dot-v4 dot-${index + 1}`}><Icon name="pin" size={15} /></span><p><strong>{area}</strong><small>{count} complaint{count === 1 ? "" : "s"}</small></p></div>
              )) : <p className="dashboard-empty-v4">No community location data yet.</p>}
            </div>
          </section>

          <section className="dashboard-card-v4 recent-card-v4">
            <div className="card-heading-v4"><div><span>YOUR REPORTS</span><h3>Recent complaints</h3></div><Link to="/complaints/mine">View all</Link></div>
            {recent.length ? (
              <div className="recent-table-wrap-v4">
                <table className="recent-table-v4">
                  <thead><tr><th>Issue</th><th>Area</th><th>Priority</th><th>Status</th><th>Upvotes</th></tr></thead>
                  <tbody>
                    {recent.map((c) => (
                      <tr key={c._id}>
                        <td><strong>{c.title}</strong><small>{c.category}</small></td>
                        <td>{c.area}</td>
                        <td><span className={`priority ${String(c.priority || "Low").toLowerCase()}`}>{c.priority || "Low"}</span></td>
                        <td><span className={`status ${String(c.status || "Pending").toLowerCase().replace(" ", "-")}`}>{c.status}</span></td>
                        <td><b className="vote-count-v4">▲ {c.upvotes || 0}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="dashboard-empty-action-v4"><span>+</span><div><strong>No reports yet</strong><p>Your submitted complaints will appear here.</p></div><Link to="/complaints/new">Report your first issue</Link></div>
            )}
          </section>
        </div>

        <div className="dashboard-tip-v4">
          <div className="tip-icon-v4">AI</div>
          <div><strong>How CivicConnect prioritizes complaints</strong><p>Priority increases using community upvotes and how long an unresolved complaint has been open, helping officers focus attention where it matters most.</p></div>
          <Link to="/complaints">Support an issue <Icon name="arrow" size={15} /></Link>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
