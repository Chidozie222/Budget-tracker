import { BASE_URL } from "./shareDate.api";

export const getBudgetsRequest = async (accessToken) => {
  try {
    const response = await fetch(`${BASE_URL}/budgets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Something is wrong");
    }

    return Array.isArray(data) ? data : (data?.data ?? data ?? []);
  } catch (error) {
    console.error("getBudgetsRequest error:", error);
    throw error;
  }
};

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

    return Array.isArray(data) ? data : (data?.data ?? data ?? []);
  } catch (error) {
    console.error("activeBudgetRequest error:", error);
    throw error;
  }
};
