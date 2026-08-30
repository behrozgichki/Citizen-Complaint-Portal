import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMyComplaints,
  submitComplaintFeedback,
} from "../services/complaints";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [feedbackComplaint, setFeedbackComplaint] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyComplaints();

      console.log("MY COMPLAINTS:", response.data);

      setComplaints(response.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!feedbackComplaint) return;

    try {
      setSubmittingFeedback(true);

      await submitComplaintFeedback(
        feedbackComplaint._id,
        rating,
        comment
      );

      alert("Feedback submitted successfully");

      setFeedbackComplaint(null);
      setRating(5);
      setComment("");

      await loadComplaints();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        Loading complaints...
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <span className="eyebrow">YOUR REPORTS</span>

          <h1>My Complaints</h1>

          <p>
            Track the progress of issues you have reported.
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="primary-button"
        >
          + Report Problem
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="empty-state">
          <h2>No complaints yet</h2>

          <p>
            When you report a civic problem, it will appear here.
          </p>

          <Link
            to="/complaints/new"
            className="primary-button"
          >
            Report Problem
          </Link>
        </div>
      ) : (
        <div className="complaints-grid">
          {complaints.map((complaint) => (
            <div
              className="complaint-card"
              key={complaint._id}
            >
              <div className="card-top">
                <span className="category">
                  {complaint.category}
                </span>

                <span
                  className={`status ${complaint.status
                    ?.toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {complaint.status}
                </span>
              </div>

              <h2>{complaint.title}</h2>

              <p className="area">
                📍 {complaint.area}
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

              <div className="complaint-meta">
                <span>
                  ▲ {complaint.upvotes || 0} upvotes
                </span>

                <span>
                  Priority:{" "}
                  <strong>
                    {complaint.priority || "Low"}
                  </strong>
                </span>
              </div>

              {complaint.officerRemark && (
                <div className="officer-remark">
                  <strong>Officer Update</strong>

                  <p>
                    {complaint.officerRemark}
                  </p>
                </div>
              )}

              {complaint.status?.trim().toLowerCase() === "resolved" &&
                complaint.feedbackGiven !== true && (
                  <div style={{ marginTop: "18px" }}>
                    <button
                      className="primary-button"
                      onClick={() => {
                        setFeedbackComplaint(complaint);
                        setRating(5);
                        setComment("");
                      }}
                    >
                      Give Feedback
                    </button>
                  </div>
                )}

              {complaint.feedbackGiven === true && (
                <div
                  className="feedback-result"
                  style={{
                    marginTop: "18px",
                    padding: "14px",
                    background: "#f4f5f7",
                    borderRadius: "10px",
                  }}
                >
                  <strong>
                    Your Rating: {complaint.feedbackRating}/5
                  </strong>

                  {complaint.feedbackComment && (
                    <p>
                      {complaint.feedbackComment}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {feedbackComplaint && (
        <div
          className="modal-overlay"
          onClick={() => setFeedbackComplaint(null)}
        >
          <div
            className="complaint-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  RESOLUTION FEEDBACK
                </span>

                <h2>
                  How was this issue handled?
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() => setFeedbackComplaint(null)}
              >
                ×
              </button>
            </div>

            <p>
              Complaint:{" "}
              <strong>
                {feedbackComplaint.title}
              </strong>
            </p>

            <div className="form-group">
              <label>Rating</label>

              <select
                value={rating}
                onChange={(event) =>
                  setRating(Number(event.target.value))
                }
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Very Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Comment</label>

              <textarea
                rows="4"
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                placeholder="Tell us about your experience..."
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => setFeedbackComplaint(null)}
                disabled={submittingFeedback}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                disabled={submittingFeedback}
                onClick={handleFeedback}
              >
                {submittingFeedback
                  ? "Submitting..."
                  : "Submit Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyComplaints;