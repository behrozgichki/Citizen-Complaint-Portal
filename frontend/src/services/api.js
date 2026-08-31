const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

const refreshAccessToken = async () => {
  const response = await fetch(`${API_URL}/refresh-token`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Refresh failed");
  }

  localStorage.setItem("accessToken", data.accessToken);

  return data.accessToken;
};

export const authenticatedFetch = async (
  endpoint,
  options = {}
) => {
  let token = localStorage.getItem("accessToken");

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },

    credentials: "include",
  });

  if (response.status === 401 || response.status === 403) {
    try {
      token = await refreshAccessToken();

      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,

        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },

        credentials: "include",
      });
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
};