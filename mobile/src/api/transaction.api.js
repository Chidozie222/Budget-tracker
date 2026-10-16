import { BASE_URL } from "./shareDate.api";

export const listTransactionsRequest = async (
  budgetId,
  categoryId = null,
  date = null,
  accessToken,
) => {
  try {
    const params = new URLSearchParams();

    if (categoryId !== null && categoryId !== undefined) {
      params.append("categoryId", String(categoryId));
    }

    if (date !== null && date !== undefined) {
      params.append("date", String(date));
    }

    const url = `${BASE_URL}/transactions/${budgetId}${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Something is wrong");
    }

    return Array.isArray(data) ? data : (data?.data ?? []);
  } catch (error) {
    console.log("ListTransactionsRequest:", error);
    throw error;
  }
};

export const createTransactionRequest = async ({
  budgetId,
  categoryId,
  amount,
  description,
  accessToken,
}) => {
  try {
    const cleanedAmount = Number(amount);

    if (
      !budgetId ||
      !categoryId ||
      Number.isNaN(cleanedAmount) ||
      cleanedAmount <= 0
    ) {
      throw new Error("Valid budget, category, and amount are required");
    }

    const response = await fetch(`${BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        budgetId,
        categoryId,
        amount: cleanedAmount,
        description: description?.trim() || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to create transaction");
    }

    return data;
  } catch (error) {
    console.error("createTransactionRequest error:", error);
    throw error;
  }
};

export const getTransactionByBudgetRequest = async (
  budgetId,
  date = null,
  take = null,
  skip = null,
  accessToken,
) => {
  try {
    if (date === null) {
      throw new Error("Date must be provided");
    }

    const params = new URLSearchParams();
    params.append("date", date);

    if (take !== null && take !== undefined) {
      params.append("take", String(take));
    }

    if (skip !== null && skip !== undefined) {
      params.append("skip", String(skip));
    }

    const url = `${BASE_URL}/transactions/trans/${budgetId}?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Something is wrong");
    }

    return Array.isArray(data) ? data : (data?.data ?? []);
  } catch (error) {
    console.log("GetTransactionByBudgetRequest:", error);
    throw error;
  }
};

export default {
  listTransactionsRequest,
  createTransactionRequest,
  getTransactionByBudgetRequest,
};
