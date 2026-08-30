const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const getToken = () =>
  localStorage.getItem("accessToken");

// ==========================================
// CREATE COMPLAINT
// ==========================================

export const createComplaint = async (complaintData) => {
  const response = await fetch(
    `${API_URL}/api/complaints`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },

      credentials: "include",

      body: JSON.stringify(complaintData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create complaint"
    );
  }

  return data;
};

// ==========================================
// GET ALL COMPLAINTS
// ==========================================

export const getComplaints = async () => {
  const response = await fetch(
    `${API_URL}/api/complaints`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${getToken()}`,
      },

      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load complaints"
    );
  }

  return data;
};

// ==========================================
// GET MY COMPLAINTS
// ==========================================

export const getMyComplaints = async () => {
  const response = await fetch(
    `${API_URL}/api/complaints/mine`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${getToken()}`,
      },

      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load your complaints"
    );
  }

  return data;
};

// ==========================================
// UPVOTE COMPLAINT
// ==========================================

export const upvoteComplaint = async (id) => {
  const response = await fetch(
    `${API_URL}/api/complaints/${id}/upvote`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${getToken()}`,
      },

      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to upvote complaint"
    );
  }

  return data;
};

// ==========================================
// UPDATE STATUS - OFFICER
// ==========================================

export const updateComplaintStatus = async (
  id,
  status,
  officerRemark
) => {
  const response = await fetch(
    `${API_URL}/api/complaints/${id}/status`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },

      credentials: "include",

      body: JSON.stringify({
        status,
        officerRemark,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update complaint"
    );
  }

  return data;
};

// ==========================================
// CITIZEN FEEDBACK
// ==========================================

export const submitComplaintFeedback = async (
  id,
  rating,
  comment
) => {
  const response = await fetch(
    `${API_URL}/api/complaints/${id}/feedback`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },

      credentials: "include",

      body: JSON.stringify({
        rating,
        comment,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to submit feedback"
    );
  }

  return data;
};

// ==========================================
// OFFICER AI BRIEFING
// ==========================================

export const generateOfficerBriefing = async () => {
  const response = await fetch(
    `${API_URL}/api/ai/officer-summary`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${getToken()}`,
      },

      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to generate officer briefing"
    );
  }

  return data;
};