import { useEffect, useState } from "react";

import {
  getComplaints,
  upvoteComplaint,
} from "../services/complaints";

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const response = await getComplaints();
      setComplaints(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

const handleUpvote = async (id) => {
  try {
    const response = await upvoteComplaint(id);

    setComplaints((current) =>
      current.map((complaint) =>
        complaint._id === id
          ? {
              ...complaint,
              upvotes:
                response.data?.upvotes ??
                response.complaint?.upvotes ??
                complaint.upvotes + 1,
              hasUpvoted: true,
            }
          : complaint
      )
    );
  } catch (error) {
    const message =
      error.message?.toLowerCase() || "";

    if (message.includes("already upvoted")) {
      setComplaints((current) =>
        current.map((complaint) =>
          complaint._id === id
            ? {
                ...complaint,
                hasUpvoted: true,
              }
            : complaint
        )
      );

      return;
    }

    console.error("UPVOTE ERROR:", error);
  }
};

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(search.toLowerCase()) ||
      complaint.area.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || complaint.category === category;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <span className="eyebrow">COMMUNITY</span>
          <h1>Browse Civic Issues</h1>

          <p>
            See what's happening in your community and support
            issues that affect you.
          </p>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by issue or area..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option>All</option>
          <option>Road</option>
          <option>Garbage</option>
          <option>Water</option>
          <option>Electricity</option>
          <option>Other</option>
        </select>
      </div>

      <div className="complaints-grid">
        {filteredComplaints.map((complaint) => (
          <article
            className="complaint-card"
            key={complaint._id}
          >
            <div className="card-top">
              <span className={`priority ${complaint.priority?.toLowerCase()}`}>
                {complaint.priority}
              </span>

              <span
                className={`status ${complaint.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {complaint.status}
              </span>
            </div>

            <h2>{complaint.title}</h2>

            <p className="area">
              {complaint.category} • {complaint.area}
            </p>

            <p className="description">
              {complaint.description}
            </p>
            {complaint.imageUrl && (
  <div
    style={{
      marginTop: "14px",
      marginBottom: "14px",
    }}
  >
    <img
      src={complaint.imageUrl}
      alt={complaint.title}
      style={{
        width: "100%",
        maxHeight: "260px",
        objectFit: "cover",
        borderRadius: "12px",
      }}
      onError={(event) => {
        event.currentTarget.style.display =
          "none";
      }}
    />
  </div>
)}

            <div className="card-footer">
             <span>
  {complaint.upvotes || 0} community votes
</span>
              <button
  className={`vote-button ${
    complaint.hasUpvoted ? "upvoted" : ""
  }`}
  onClick={() =>
    handleUpvote(complaint._id)
  }
  disabled={complaint.hasUpvoted}
>
  {complaint.hasUpvoted
    ? "✓ Upvoted"
    : "▲ Upvote"}
</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Complaints;