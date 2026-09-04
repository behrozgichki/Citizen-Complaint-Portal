import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import OfficerAnalytics from "../components/OfficerAnalytics";
import ComplaintMap from "../components/ComplaintMap";
import {
  getComplaints,
  updateComplaintStatus,
  generateOfficerBriefing,
} from "../services/complaints";


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
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="4" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
    inbox: <><path d="M4 5h16l-2 14H6L4 5Z"/><path d="M4.8 13h4l1.5 2h3.4l1.5-2h4"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.5 3.7 5.5 3.7 9S14.5 18.5 12 21c-2.5-2.5-3.7-5.5-3.7-9S9.5 5.5 12 3Z"/></>,
    alert: <><path d="M10.3 4.1 2.5 18a1.5 1.5 0 0 0 1.3 2.2h16.4a1.5 1.5 0 0 0 1.3-2.2L13.7 4.1a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8.2 12.2 2.5 2.5 5.3-5.4"/></>,
    star: <><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></>,
    vote: <><path d="M7 10v10H4V10h3Z"/><path d="M7 18h9.5a2 2 0 0 0 1.9-1.4l1.4-4.5A2 2 0 0 0 17.9 9H14l.7-3.1A2.4 2.4 0 0 0 12.4 3L7 10"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    spark: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z"/><path d="m18.5 13 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></>,
  };

  return <svg {...props}>{icons[name]}</svg>;
}

const categories = ["Road", "Garbage", "Water", "Electricity", "Other"];

function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editStatus, setEditStatus] = useState("Pending");
  const [remark, setRemark] = useState("");
  const [updating, setUpdating] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  const storedUser = localStorage.getItem("user");
  let user = null;
  try { user = storedUser ? JSON.parse(storedUser) : null; } catch { user = null; }
  const officerName = user?.email ? user.email.split("@")[0] : "Officer";
  const friendlyName = officerName.charAt(0).toUpperCase() + officerName.slice(1);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getComplaints();
      setComplaints(response.data || []);
    } catch (error) {
      setError(error.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setEditStatus(complaint.status || "Pending");
    setRemark(complaint.officerRemark || "");
  };

  const handleCloseModal = () => {
    if (updating) return;
    setSelectedComplaint(null);
    setRemark("");
  };

  const handleUpdate = async () => {
    if (!selectedComplaint) return;
    try {
      setUpdating(true);
      const response = await updateComplaintStatus(
        selectedComplaint._id,
        editStatus,
        remark
      );
      const updatedComplaint = response.data;
      setComplaints((current) =>
        current.map((complaint) =>
          complaint._id === selectedComplaint._id
            ? {
                ...complaint,
                ...updatedComplaint,
              }
            : complaint
        )
      );
      setSelectedComplaint(null);
      setRemark("");
    } catch (error) {
      alert(error.message || "Failed to update complaint");
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateBriefing = async () => {
    try {
      setGeneratingSummary(true);
      const response = await generateOfficerBriefing();
      setAiSummary(response.data?.summary || "No briefing available.");
      setAiGenerated(response.aiGenerated === true);
    } catch (error) {
      alert(error.message || "Failed to generate briefing");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const searchText = search.trim().toLowerCase();
      const matchesSearch =
        !searchText ||
        complaint.title?.toLowerCase().includes(searchText) ||
        complaint.description?.toLowerCase().includes(searchText) ||
        complaint.area?.toLowerCase().includes(searchText) ||
        complaint.category?.toLowerCase().includes(searchText);
      const matchesCategory = categoryFilter === "All" || complaint.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || complaint.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [complaints, search, categoryFilter, statusFilter]);
  const sortedComplaints = useMemo(() => {
  const priorityRank = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return [...filteredComplaints].sort((a, b) => {
    // 1. Critical > High > Medium > Low
    const priorityDifference =
      (priorityRank[b.priority] || 0) -
      (priorityRank[a.priority] || 0);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    // 2. Higher priority score first
    const scoreDifference =
      Number(b.priorityScore || 0) -
      Number(a.priorityScore || 0);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    // 3. More upvotes first
    const upvoteDifference =
      Number(b.upvotes || 0) -
      Number(a.upvotes || 0);

    if (upvoteDifference !== 0) {
      return upvoteDifference;
    }

    // 4. Newest first if everything else is equal
    return (
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
    );
  });
}, [filteredComplaints]);

  const metrics = useMemo(() => {
    const pending = complaints.filter((c) => c.status === "Pending").length;
    const inProgress = complaints.filter((c) => c.status === "In Progress").length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    const urgent = complaints.filter((c) => c.priority === "High" || c.priority === "Critical").length;
    const feedback = complaints.filter((c) => c.feedbackGiven && c.feedbackRating);
    const rating = feedback.length
      ? (feedback.reduce((sum, c) => sum + Number(c.feedbackRating), 0) / feedback.length).toFixed(1)
      : "N/A";
    const upvotes = complaints.reduce((sum, c) => sum + Number(c.upvotes || 0), 0);
    return { total: complaints.length, pending, inProgress, resolved, urgent, rating, upvotes };
  }, [complaints]);

  const categoryData = useMemo(() => {
    const values = categories.map((name) => ({
      name,
      value: complaints.filter((c) => c.category === name).length,
    }));
    const max = Math.max(...values.map((item) => item.value), 1);
    return values.map((item) => ({ ...item, percent: item.value ? Math.max((item.value / max) * 100, 8) : 0 }));
  }, [complaints]);

  const topAreas = useMemo(() => {
    const counts = {};
    complaints.forEach((complaint) => {
      const area = complaint.area || "Unknown area";
      counts[area] = (counts[area] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [complaints]);

const urgentQueue = useMemo(() => {
  const rank = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return [...complaints]
    .filter((complaint) => complaint.status !== "Resolved")
    .sort((a, b) => {
      const priorityDifference =
        (rank[b.priority] || 0) -
        (rank[a.priority] || 0);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      const scoreDifference =
        Number(b.priorityScore || 0) -
        Number(a.priorityScore || 0);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return (
        Number(b.upvotes || 0) -
        Number(a.upvotes || 0)
      );
    })
    .slice(0, 4);
}, [complaints]);

  const handleExportCSV = () => {
    if (!filteredComplaints.length) {
      alert("No complaints available to export.");
      return;
    }

    const headers = [
      "Title", "Category", "Area", "Status", "Priority", "Upvotes",
      "Officer Remark", "Feedback Rating", "Feedback Comment", "Created At",
    ];
    const escapeCSV = (value) => value === null || value === undefined
      ? ""
      : `"${String(value).replace(/"/g, '""')}"`;
    const rows = filteredComplaints.map((complaint) => [
      complaint.title,
      complaint.category,
      complaint.area,
      complaint.status,
      complaint.priority || "Low",
      complaint.upvotes || 0,
      complaint.officerRemark || "",
      complaint.feedbackGiven ? complaint.feedbackRating : "",
      complaint.feedbackGiven ? complaint.feedbackComment : "",
      complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : "",
    ].map(escapeCSV));

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `complaints-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="officer-loading-v6">
        <div className="officer-loader-v6"></div>
        <strong>Preparing municipal command center…</strong>
        <span>Loading live complaint operations</span>
      </div>
    );
  }

  return (
    <main className="officer-page-v6">
      <aside className="officer-sidebar-v6">
        <div className="officer-profile-v6">
          <div className="officer-avatar-v6">{friendlyName.charAt(0)}</div>
          <div>
            <strong>{friendlyName}</strong>
            <span>Municipal Officer</span>
          </div>
          <i>ON DUTY</i>
        </div>

        <p className="officer-side-label-v6">OPERATIONS</p>
        <nav>
          <a className="officer-side-link-v6 active" href="#command"><Icon name="dashboard"/><span>Command Center<small>Live service overview</small></span></a>
          <a className="officer-side-link-v6" href="#queue"><Icon name="inbox"/><span>Complaint Queue<small>Review & update cases</small></span></a>
          <a className="officer-side-link-v6" href="#priority"><Icon name="alert"/><span>Priority Watch<small>Urgent community issues</small></span></a>
          <Link className="officer-side-link-v6" to="/complaints"><Icon name="globe"/><span>Public Feed<small>Citizen-facing view</small></span></Link>
        </nav>

        <div className="officer-side-divider-v6"></div>
        <p className="officer-side-label-v6">QUICK ACTIONS</p>
        <button className="officer-side-action-v6" onClick={handleGenerateBriefing} disabled={generatingSummary}>
          <Icon name="spark"/><span><strong>{generatingSummary ? "Analyzing data…" : "Generate AI Brief"}</strong><small>Summarize live operations</small></span>
        </button>
        <button className="officer-side-action-v6" onClick={handleExportCSV}>
          <Icon name="download"/><span><strong>Export Report</strong><small>Download filtered CSV</small></span>
        </button>

        <div className="officer-side-note-v6">
          <span>MUNICIPAL STANDARD</span>
          <strong>Resolve what matters most.</strong>
          <p>Priority combines community support and complaint age to surface urgent cases.</p>
        </div>

        <button className="officer-logout-v6" onClick={handleLogout}><Icon name="logout"/> Sign out</button>
      </aside>

      <section className="officer-main-v6" id="command">
        <div className="officer-toolbar-v6">
          <div>
            <span className="eyebrow">MUNICIPAL OPERATIONS CENTER</span>
            <h1>Officer Command Center</h1>
            <p>Prioritize citizen needs, coordinate resolution, and track service performance from one place.</p>
          </div>
          <div className="officer-toolbar-actions-v6">
            <span className="officer-live-v6"><i></i> Live data</span>
            <button className="secondary-button" onClick={loadComplaints}>Refresh</button>
            <button className="primary-button" onClick={handleExportCSV}><Icon name="download" size={16}/> Export CSV</button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <section className="officer-hero-v6">
          <div className="officer-hero-copy-v6">
            <span>OPERATIONS PULSE</span>
            <h2>{metrics.urgent > 0 ? `${metrics.urgent} priority cases need attention today.` : "Operations are currently under control."}</h2>
            <p>{metrics.pending} complaints are waiting for review, while {metrics.inProgress} are actively being handled by municipal teams.</p>
            <div className="officer-hero-actions-v6">
              <a href="#queue">Open complaint queue <Icon name="arrow" size={16}/></a>
              <button onClick={handleGenerateBriefing} disabled={generatingSummary}><Icon name="spark" size={16}/>{generatingSummary ? "Analyzing…" : "Generate AI briefing"}</button>
            </div>
          </div>
          <div className="officer-hero-meter-v6">
            <div className="resolution-ring-v6" style={{ "--progress": `${metrics.total ? Math.round((metrics.resolved / metrics.total) * 100) : 0}%` }}>
              <div><strong>{metrics.total ? Math.round((metrics.resolved / metrics.total) * 100) : 0}%</strong><span>resolved</span></div>
            </div>
            <div className="officer-hero-mini-v6"><span>COMMUNITY SIGNAL</span><strong>{metrics.upvotes}</strong><small>total upvotes across cases</small></div>
          </div>
        </section>

        <div className="officer-section-heading-v6">
          <div><span>LIVE PERFORMANCE</span><h2>Service overview</h2></div>
          <small>Calculated from current complaint data</small>
        </div>

        <div className="officer-stats-v6">
          <article><span className="officer-stat-icon-v6 blue"><Icon name="inbox"/></span><div><small>Total Cases</small><strong>{metrics.total}</strong><em>All citizen reports</em></div></article>
          <article><span className="officer-stat-icon-v6 amber"><Icon name="clock"/></span><div><small>Awaiting Review</small><strong>{metrics.pending}</strong><em>Pending assignment</em></div></article>
          <article><span className="officer-stat-icon-v6 cyan"><Icon name="clock"/></span><div><small>In Progress</small><strong>{metrics.inProgress}</strong><em>Teams actively working</em></div></article>
          <article><span className="officer-stat-icon-v6 navy"><Icon name="check"/></span><div><small>Resolved</small><strong>{metrics.resolved}</strong><em>Successfully closed</em></div></article>
          <article><span className="officer-stat-icon-v6 red"><Icon name="alert"/></span><div><small>Priority Watch</small><strong>{metrics.urgent}</strong><em>High & critical cases</em></div></article>
          <article><span className="officer-stat-icon-v6 violet"><Icon name="star"/></span><div><small>Satisfaction</small><strong>{metrics.rating === "N/A" ? "—" : `${metrics.rating}/5`}</strong><em>Citizen resolution rating</em></div></article>
        </div>

        <section className={`officer-ai-v6 ${aiSummary ? "has-summary" : ""}`}>
          <div className="officer-ai-icon-v6">AI</div>
          <div className="officer-ai-copy-v6">
            <span>AI OPERATIONS BRIEF</span>
            <h3>{aiSummary ? "Briefing generated from live complaint activity" : "Turn live complaint data into a concise officer briefing"}</h3>
            <p>{aiSummary || "Get a fast summary of current workload, priority cases, category trends and community signals before your next review cycle."}</p>
            {aiSummary && <small>{aiGenerated ? "AI-generated using live complaint statistics" : "Smart fallback generated from live complaint statistics"}</small>}
          </div>
          <button className="secondary-button" onClick={handleGenerateBriefing} disabled={generatingSummary}>
            <Icon name="spark" size={16}/>{generatingSummary ? "Analyzing…" : aiSummary ? "Regenerate" : "Generate Brief"}
          </button>
        </section>

        <div className="officer-insights-grid-v6" id="priority">
          <section className="officer-panel-v6 priority-panel-v6">
            <div className="officer-panel-head-v6"><div><span>PRIORITY WATCH</span><h3>Cases requiring attention</h3></div><Icon name="alert"/></div>
            <div className="priority-queue-v6">
              {urgentQueue.length ? urgentQueue.map((complaint) => (
                <button key={complaint._id} onClick={() => handleOpenComplaint(complaint)}>
                  <span className={`priority ${String(complaint.priority || "Low").toLowerCase()}`}>{complaint.priority || "Low"}</span>
                  <div><strong>{complaint.title}</strong><small><Icon name="pin" size={13}/> {complaint.area} · {complaint.category}</small></div>
                  <b>▲ {complaint.upvotes || 0}</b>
                </button>
              )) : <div className="officer-empty-mini-v6">No active complaints in the queue.</div>}
            </div>
          </section>

          <section className="officer-panel-v6">
            <div className="officer-panel-head-v6"><div><span>WORKLOAD MIX</span><h3>Complaints by category</h3></div></div>
            <div className="officer-category-bars-v6">
              {categoryData.map((item) => (
                <div key={item.name}><div><span>{item.name}</span><strong>{item.value}</strong></div><div className="officer-bar-v6"><i style={{ width: `${item.percent}%` }}></i></div></div>
              ))}
            </div>
          </section>

          <section className="officer-panel-v6 area-panel-v6">
            <div className="officer-panel-head-v6"><div><span>AREA SIGNALS</span><h3>Top reported locations</h3></div><Icon name="pin"/></div>
            <div className="officer-areas-v6">
              {topAreas.length ? topAreas.map(([area, count], index) => (
                <div key={area}><span>{String(index + 1).padStart(2, "0")}</span><p><strong>{area}</strong><small>{count} complaint{count === 1 ? "" : "s"}</small></p><b>{Math.round((count / Math.max(metrics.total, 1)) * 100)}%</b></div>
              )) : <div className="officer-empty-mini-v6">No location data available.</div>}
            </div>
          </section>
        </div>
<OfficerAnalytics complaints={complaints} />
<ComplaintMap complaints={complaints} />
        <section className="officer-queue-v6" id="queue">
          <div className="officer-queue-head-v6">
            <div><span>CASE MANAGEMENT</span><h2>Complaint queue</h2><p>Search, filter and open a complaint to update its resolution progress.</p></div>
            <div className="officer-count-v6"><strong>{filteredComplaints.length}</strong><span>of {complaints.length}<br/>cases shown</span></div>
          </div>

          <div className="officer-filters-v6">
            <label className="officer-search-v6"><Icon name="search"/><input type="text" placeholder="Search complaint, area or category…" value={search} onChange={(e) => setSearch(e.target.value)}/></label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All categories</option>
              {categories.map((category) => <option value={category} key={category}>{category}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            {(search || categoryFilter !== "All" || statusFilter !== "All") && (
              <button className="officer-clear-v6" onClick={() => { setSearch(""); setCategoryFilter("All"); setStatusFilter("All"); }}>Clear filters</button>
            )}
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="officer-empty-v6"><Icon name="inbox" size={30}/><h3>No complaints match these filters</h3><p>Try a different search term, category or status.</p></div>
          ) : (
            <div className="officer-table-wrap-v6">
              <table className="officer-table-v6">
                <thead><tr><th>Case</th><th>Location</th><th>Priority</th><th>Status</th><th>Signal</th><th>Feedback</th><th></th></tr></thead>
                <tbody>
                 {sortedComplaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td><div className="officer-case-v6"><span>{complaint.category?.charAt(0) || "C"}</span><p><strong>{complaint.title}</strong><small>{complaint.category} · {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "Recent"}</small></p></div></td>
                      <td><span className="officer-location-v6"><Icon name="pin" size={14}/>{complaint.area}</span></td>
                      <td><span className={`priority ${String(complaint.priority || "Low").toLowerCase()}`}>{complaint.priority || "Low"}</span></td>
                      <td><span className={`status ${String(complaint.status || "Pending").toLowerCase().replace(" ", "-")}`}>{complaint.status}</span></td>
                      <td><b className="officer-votes-v6">▲ {complaint.upvotes || 0}</b></td>
                      <td>{complaint.feedbackGiven ? <span className="officer-rating-v6">★ {complaint.feedbackRating}/5</span> : <span className="officer-muted-v6">{complaint.status === "Resolved" ? "Awaiting" : "—"}</span>}</td>
                      <td><button className="officer-review-v6" onClick={() => handleOpenComplaint(complaint)}>Review <Icon name="arrow" size={14}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {selectedComplaint && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="complaint-modal officer-modal-v6" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header officer-modal-head-v6">
              <div><span className="eyebrow">CASE REVIEW</span><h2>{selectedComplaint.title}</h2><p>Review citizen evidence and record the municipal response.</p></div>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>

            <div className="officer-modal-grid-v6">
              <section>
                <div className="officer-case-meta-v6">
                  <div><span>Category</span><strong>{selectedComplaint.category}</strong></div>
                  <div><span>Area</span><strong>{selectedComplaint.area}</strong></div>
                  <div><span>Priority</span><strong>{selectedComplaint.priority || "Low"}</strong></div>
                  <div><span>Community signal</span><strong>▲ {selectedComplaint.upvotes || 0}</strong></div>
                </div>
                <div className="officer-description-v6"><span>CITIZEN DESCRIPTION</span><p>{selectedComplaint.description}</p></div>
                {selectedComplaint.imageUrl && (
                  <div className="officer-evidence-v6"><span>PHOTO EVIDENCE</span><img src={selectedComplaint.imageUrl} alt={selectedComplaint.title}/></div>
                )}
                {selectedComplaint.feedbackGiven && (
                  <div className="officer-feedback-v6"><span>CITIZEN FEEDBACK</span><strong>★ {selectedComplaint.feedbackRating}/5</strong>{selectedComplaint.feedbackComment && <p>“{selectedComplaint.feedbackComment}”</p>}</div>
                )}
              </section>

              <aside className="officer-response-v6">
                <span className="eyebrow">OFFICER ACTION</span>
                <h3>Update resolution progress</h3>
                <p>Changes are visible to the citizen immediately after saving.</p>
                <div className="form-group"><label>Complaint status</label><select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}><option>Pending</option><option>In Progress</option><option>Resolved</option></select></div>
                <div className="form-group"><label>Officer remark</label><textarea rows="6" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Example: Road maintenance team assigned. Repair scheduled for tomorrow."/></div>
                <div className="officer-response-tip-v6"><Icon name="check"/><p><strong>Clear updates build trust.</strong><small>Use remarks to explain what has happened and what citizens should expect next.</small></p></div>
                <div className="modal-actions"><button type="button" className="secondary-button" onClick={handleCloseModal} disabled={updating}>Cancel</button><button type="button" className="primary-button" onClick={handleUpdate} disabled={updating}>{updating ? "Saving update…" : "Submit Update"}</button></div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default OfficerDashboard;
