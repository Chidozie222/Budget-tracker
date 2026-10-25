import { BASE_URL, fetchWithAuth } from "./shareDate.api";

export const getBudgetsRequest = async (accessToken) => {
  try {
    const { data } = await fetchWithAuth(`${BASE_URL}/budgets`, {
      method: "GET",
      accessToken,
    });

    return Array.isArray(data) ? data : (data?.data ?? data ?? []);
  } catch (error) {
    console.error("getBudgetsRequest error:", error);
    throw error;
  }
};

export const getBudgetByIdRequest = async (budgetId, accessToken) => {
  try {
    const { data } = await fetchWithAuth(`${BASE_URL}/budgets/${budgetId}`, {
      method: "GET",
      accessToken,
    });

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

    const { data, response } = await fetchWithAuth(`${BASE_URL}/budgets`, {
      method: "POST",
      accessToken,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: cleanName,
        income: cleanIncome,
        end_date,
      }),
    });

    return {
      ...(data ?? {}),
      status: response?.status ?? 200,
      created: response?.status === 201,
    };
  } catch (error) {
    console.error("createBudgetRequest error:", error);
    throw error;
  }
};

// Do not call hooks from modules. Pass the access token from components or
// from the auth context consumer at callsite.
export const activeBudgetRequest = async (accessToken) => {
  try {
    const { data } = await fetchWithAuth(`${BASE_URL}/budgets/active`, {
      method: "GET",
      accessToken,
    });

    return Array.isArray(data) ? data : (data?.data ?? data ?? []);
  } catch (error) {
    console.error("activeBudgetRequest error:", error);
    throw error;
  }
};
