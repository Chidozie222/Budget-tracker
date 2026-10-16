import { BASE_URL } from "./shareDate.api";

export const signupRequest = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/auth/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Signup failed");
  }

  return data;
};

export const signinRequest = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Login failed");
  }

  return data;
};

export const refreshTokenRequest = async (refreshToken) => {
  const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Refresh failed");
  }

  return data;
};

export const logoutRequest = async (refreshToken) => {
  const response = await fetch(
    `${BASE_URL}/auth/logout/${encodeURIComponent(refreshToken)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Logout failed");
  }

  return data;
};

export default {
  signupRequest,
  signinRequest,
  refreshTokenRequest,
  logoutRequest,
};
