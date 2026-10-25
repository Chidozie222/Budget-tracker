import { BASE_URL, fetchWithAuth } from "./shareDate.api";

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

    const { data } = await fetchWithAuth(url, {
      method: "GET",
      accessToken,
    });

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

    const { data } = await fetchWithAuth(`${BASE_URL}/transactions`, {
      method: "POST",
      accessToken,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        budgetId,
        categoryId,
        amount: cleanedAmount,
        description: description?.trim() || null,
      }),
    });

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
    const params = new URLSearchParams();
    if (date !== null) {
      const normalizedDate = String(date).slice(0, 10);
      params.append("date", normalizedDate);
    }

    if (take !== null && take !== undefined) {
      params.append("take", String(take));
    }

    if (skip !== null && skip !== undefined) {
      params.append("skip", String(skip));
    }

    const url = `${BASE_URL}/transactions/trans/${budgetId}?${params.toString()}`;

    const { data } = await fetchWithAuth(url, {
      method: "GET",
      accessToken,
    });

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
