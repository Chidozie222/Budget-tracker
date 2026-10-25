export const BASE_URL = "http://127.0.0.1:4000/api/v1";

let refreshAccessTokenHandler = null;
let signOutHandler = null;

export const setAuthHandlers = ({ refreshAccessToken, signOut }) => {
  refreshAccessTokenHandler = refreshAccessToken || null;
  signOutHandler = signOut || null;
};

export const fetchWithAuth = async (url, { accessToken, ...options } = {}) => {
  let currentAccessToken = accessToken;
  let retried = false;

  while (true) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(currentAccessToken
          ? { Authorization: `Bearer ${currentAccessToken}` }
          : {}),
      },
    });

    let payload = null;

    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (response.ok) {
      return { response, data: payload };
    }

    if (response.status === 401 && !retried && refreshAccessTokenHandler) {
      retried = true;

      try {
        const refreshedToken = await refreshAccessTokenHandler();

        if (refreshedToken) {
          currentAccessToken = refreshedToken;
          continue;
        }
      } catch (error) {
        if (signOutHandler) {
          try {
            await signOutHandler();
          } catch (signOutError) {
            console.warn("signOut failed after refresh error:", signOutError);
          }
        }
        throw error;
      }
    }

    if (response.status === 401 && signOutHandler && !retried) {
      try {
        await signOutHandler();
      } catch (error) {
        console.warn("signOut failed on unauthorized request:", error);
      }
    }

    throw new Error(payload?.message || "Request failed");
  }
};
