import { BASE_URL, fetchWithAuth } from "./shareDate.api";

export const listExpensesRequest = async (budgetId, accessToken) => {
  try {
    const { data } = await fetchWithAuth(`${BASE_URL}/expenses/${budgetId}`, {
      method: "GET",
      accessToken,
    });

    return Array.isArray(data) ? data : (data?.data ?? []);
  } catch (error) {
    console.error("listExpensesRequest error:", error);
    throw error;
  }
};

export const createExpenseRequest = async (expenses, accessToken) => {
  try {
    if (!Array.isArray(expenses) || expenses.length === 0) {
      throw new Error("Expenses list is required");
    }

    const { data } = await fetchWithAuth(`${BASE_URL}/expenses`, {
      method: "POST",
      accessToken,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expenses }),
    });

    return data;
  } catch (error) {
    console.error("createExpenseRequest error:", error);
    throw error;
  }
};

export default {
  listExpensesRequest,
  createExpenseRequest,
};
