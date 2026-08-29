const API_URL = "http://localhost:3000/admin";

const getToken = () => {
  return localStorage.getItem("accessToken");
};


// Get users
export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${getToken()}`,
    },

    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch users");
  }

  return data;
};


// Delete user
export const deleteUser = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${getToken()}`,
    },

    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete user");
  }

  return data;
};


// Change role
export const updateUserRole = async (id, role) => {
  const response = await fetch(
    `${API_URL}/users/${id}/role`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },

      credentials: "include",

      body: JSON.stringify({
        role,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update role");
  }

  return data;
};