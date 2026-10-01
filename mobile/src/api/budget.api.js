import { BASE_URL } from "./shareDate.api";

// Do not call hooks from modules. Pass the access token from components or
// from the auth context consumer at callsite.
export const activeBudgetRequest = async (accessToken) => {
  try {
    const response = await fetch(`${BASE_URL}/budgets/active`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Something is wrong");
    }

    return data;
  } catch (error) {
    // Let caller handle errors; log here for debugging
    console.error("activeBudgetRequest error:", error);
    throw error;
  }
};
