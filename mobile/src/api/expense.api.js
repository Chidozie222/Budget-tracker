import { BASE_URL } from "./shareDate.api";

export const listExpensesRequest = async (budgetId, accessToken) => {
  try {
    const response = await fetch(`${BASE_URL}/expenses/${budgetId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch expenses");
    }

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

    const response = await fetch(`${BASE_URL}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ expenses }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to create expenses");
    }

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
