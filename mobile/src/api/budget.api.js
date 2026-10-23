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
      console.log(data)
      throw new Error(data?.message || "Something is wrong");
    }

    return Array.isArray(data) ? data : (data?.data ?? data ?? []);
  } catch (error) {
    console.error("getBudgetsRequest error:", error);
    throw error;
  }
};

export const getBudgetByIdRequest = async (budgetId, accessToken) => {
  try {
    const response = await fetch(`${BASE_URL}/budgets/${budgetId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Something is wrong");
    }

    return data?.data ?? data ?? null;
  } catch (error) {
    console.error("getBudgetByIdRequest error:", error);
    throw error;
  }
};

export const createBudgetRequest = async (
  { name, income, end_date },
  accessToken,
) => {
  try {
    const cleanName = String(name ?? "").trim();
    const cleanIncome = Number(income);

    if (
      !cleanName ||
      Number.isNaN(cleanIncome) ||
      cleanIncome < 0 ||
      !end_date
    ) {
      throw new Error("Name, income, and end date are required");
    }

    const response = await fetch(`${BASE_URL}/budgets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: cleanName,
        income: cleanIncome,
        end_date,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Budget creation failed");
    }

    return data;
  } catch (error) {
    console.error("createBudgetRequest error:", error);
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
