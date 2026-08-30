import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

function OfficerAnalytics({ complaints = [] }) {
  const statusData = [
    {
      name: "Pending",
      value: complaints.filter((c) => c.status === "Pending").length,
    },
    {
      name: "In Progress",
      value: complaints.filter((c) => c.status === "In Progress").length,
    },
    {
      name: "Resolved",
      value: complaints.filter((c) => c.status === "Resolved").length,
    },
  ];

  const categories = [
    "Road",
    "Garbage",
    "Water",
    "Electricity",
    "Other",
  ];

  const categoryData = categories.map((category) => ({
    name: category,
    complaints: complaints.filter((c) => c.category === category).length,
  }));

  const priorities = ["Low", "Medium", "High", "Critical"];

  const priorityData = priorities.map((priority) => ({
    name: priority,
    complaints: complaints.filter(
      (c) => (c.priority || "Low") === priority
    ).length,
  }));

  const areaMap = {};

  complaints.forEach((complaint) => {
    const area = complaint.area || "Unknown";

    areaMap[area] = (areaMap[area] || 0) + 1;
  });

  const topAreas = Object.entries(areaMap)
    .map(([name, value]) => ({
      name,
      complaints: value,
    }))
    .sort((a, b) => b.complaints - a.complaints)
    .slice(0, 5);

  const monthMap = {};

  complaints.forEach((complaint) => {
    if (!complaint.createdAt) return;

    const date = new Date(complaint.createdAt);

    const month = date.toLocaleString("default", {
      month: "short",
    });

    monthMap[month] = (monthMap[month] || 0) + 1;
  });

  const trendData = Object.entries(monthMap).map(([month, value]) => ({
    month,
    complaints: value,
  }));

  const resolved = complaints.filter(
    (c) => c.status === "Resolved"
  ).length;

  const resolutionRate =
    complaints.length === 0
      ? 0
      : Math.round((resolved / complaints.length) * 100);

  const ratedComplaints = complaints.filter(
    (c) => c.feedbackGiven && c.feedbackRating
  );

  const avgRating =
    ratedComplaints.length === 0
      ? 0
      : (
          ratedComplaints.reduce(
            (sum, c) => sum + Number(c.feedbackRating),
            0
          ) / ratedComplaints.length
        ).toFixed(1);

  return (
    <section className="officer-analytics-section">
      <div className="analytics-heading">
        <div>
          <span className="eyebrow">OPERATIONS ANALYTICS</span>
          <h2>City Service Insights</h2>
          <p>
            Live complaint patterns, workload distribution, and resolution
            performance.
          </p>
        </div>
      </div>

      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <span>Resolution Rate</span>
          <strong>{resolutionRate}%</strong>
          <small>
            {resolved} of {complaints.length} complaints resolved
          </small>
        </div>

        <div className="analytics-kpi-card">
          <span>Citizen Satisfaction</span>
          <strong>{avgRating || 0}/5</strong>
          <small>{ratedComplaints.length} feedback responses</small>
        </div>

        <div className="analytics-kpi-card">
          <span>High-Risk Cases</span>
          <strong>
            {
              complaints.filter(
                (c) =>
                  c.priority === "High" || c.priority === "Critical"
              ).length
            }
          </strong>
          <small>High and critical priority complaints</small>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3>Complaints by Status</h3>
            <span>Current workload</span>
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        ["#2563eb", "#64748b", "#0f172a"][index % 3]
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3>Complaints by Category</h3>
            <span>Service demand</span>
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />

                <Bar
                  dataKey="complaints"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3>Priority Distribution</h3>
            <span>Urgency overview</span>
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />

                <Bar
                  dataKey="complaints"
                  fill="#0f172a"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-header">
            <h3>Complaint Trend</h3>
            <span>Reports over time</span>
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="complaints"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card analytics-card-wide">
          <div className="analytics-card-header">
            <h3>Top Complaint Areas</h3>
            <span>Most reported localities</span>
          </div>

          <div className="top-area-list">
            {topAreas.length === 0 ? (
              <p>No location data available yet.</p>
            ) : (
              topAreas.map((area, index) => (
                <div className="top-area-row" key={area.name}>
                  <div className="top-area-rank">{index + 1}</div>

                  <div className="top-area-info">
                    <strong>{area.name}</strong>

                    <div className="top-area-bar">
                      <div
                        className="top-area-fill"
                        style={{
                          width: `${
                            (area.complaints /
                              Math.max(
                                ...topAreas.map((item) => item.complaints)
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <span>{area.complaints} reports</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OfficerAnalytics;