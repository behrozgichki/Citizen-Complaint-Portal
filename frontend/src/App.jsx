import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashbord";
import ProtectedRoute from "./components/ProctectedRoutes";
import CreateComplaint from "./pages/CreateComplaint";
import MyComplaints from "./pages/MyComplaints";
import Complaints from "./pages/Complaints";
import OfficerDashboard from "./pages/OfficerDashbord";
import OfficerRoute from "./components/OfficerRoute";
import "./App.css";
import "./styles/complaint.css";

function Home() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <div className="civic-pill"><span></span> A smarter way to improve your neighborhood</div>
          <h1>Report locally.<br /><em>See action publicly.</em></h1>
          <p>
            CivicConnect turns everyday civic problems into transparent, trackable cases.
            Citizens report and support issues while municipal officers prioritize, update and resolve them.
          </p>
          <div className="landing-actions">
            <Link to="/register" className="primary-button hero-primary">Report a civic issue <span>→</span></Link>
            <Link to="/complaints" className="secondary-button">View community issues</Link>
          </div>
          <div className="hero-proof">
            <div><span className="proof-icon">01</span><p><strong>Evidence first</strong><small>Photo, area & category</small></p></div>
            <div><span className="proof-icon">02</span><p><strong>Community powered</strong><small>Upvotes affect priority</small></p></div>
            <div><span className="proof-icon">03</span><p><strong>Closed loop</strong><small>Status, remarks & feedback</small></p></div>
          </div>
        </div>

        <div className="landing-visual" aria-hidden="true">
          <div className="visual-topbar"><span><i></i> LIVE CIVIC OPERATIONS</span><b>Community View</b></div>
          <div className="map-grid"></div>
          <div className="pulse pulse-one"></div><div className="pulse pulse-two"></div><div className="pulse pulse-three"></div>
          <div className="issue-preview issue-preview-main">
            <div className="preview-top"><span className="preview-icon">⌁</span><span className="status in-progress">In Progress</span></div>
            <div className="preview-kicker">ELECTRICITY · BLOCK 5</div>
            <h3>Streetlight outage near public park</h3>
            <p>Reported by a citizen · Municipal team assigned</p>
            <div className="preview-progress"><span></span></div>
            <div className="preview-bottom"><small>Resolution progress</small><strong>68%</strong></div>
          </div>
          <div className="issue-preview mini-preview"><span className="mini-dot"></span><div><strong>24</strong><small>community upvotes</small></div></div>
          <div className="issue-preview priority-preview"><span>PRIORITY</span><strong>High</strong><small>score updated automatically</small></div>
          <div className="visual-label">CIVICCONNECT · TRANSPARENCY BY DESIGN</div>
        </div>
      </section>

      <section className="impact-band">
        <div><strong>1 portal</strong><span>Citizens + officers in one workflow</span></div>
        <div><strong>4 stages</strong><span>Report · Prioritize · Resolve · Review</span></div>
        <div><strong>Live priority</strong><span>Age + community upvotes</span></div>
        <div><strong>Full visibility</strong><span>Every status and officer remark</span></div>
      </section>

      <section className="landing-features">
        <div className="feature-heading">
          <div><div className="section-kicker">A COMPLETE CIVIC RESOLUTION LOOP</div><h2>From complaint to accountability.</h2></div>
          <p>Designed so the citizen always knows what happens next, and officers can focus on the issues that matter most.</p>
        </div>
        <div className="feature-grid">
          <article><span>01</span><div className="feature-icon">＋</div><h3>Report clearly</h3><p>Submit the issue with category, locality, description and photographic evidence.</p></article>
          <article><span>02</span><div className="feature-icon">↑</div><h3>Prioritize together</h3><p>Community upvotes and issue age automatically help urgent complaints rise.</p></article>
          <article><span>03</span><div className="feature-icon">✓</div><h3>Track action</h3><p>Follow Pending, In Progress and Resolved stages with officer remarks.</p></article>
          <article><span>04</span><div className="feature-icon">★</div><h3>Close the loop</h3><p>Citizens rate resolved complaints, making service quality visible and measurable.</p></article>
        </div>
      </section>

      <section className="judges-strip">
        <div><span className="section-kicker">BUILT FOR REAL CIVIC OPERATIONS</span><h2>Transparent for citizens. Actionable for officers.</h2></div>
        <div className="judges-points"><span>Photo evidence</span><span>Duplicate detection</span><span>Priority scoring</span><span>AI officer briefing</span><span>CSV reporting</span><span>Citizen feedback</span></div>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<OfficerRoute><OfficerDashboard /></OfficerRoute>} />
        <Route path="/complaints/new" element={<ProtectedRoute><CreateComplaint /></ProtectedRoute>} />
        <Route path="/complaints/mine" element={<ProtectedRoute><MyComplaints /></ProtectedRoute>} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/officer/dashboard" element={<OfficerRoute><OfficerDashboard /></OfficerRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
