import { BASE_URL, fetchWithAuth } from "./shareDate.api";

export const listSavingsRequest = async (budgetId, accessToken) => {
  try {
    const { data } = await fetchWithAuth(`${BASE_URL}/savings/${budgetId}`, {
      method: "GET",
      accessToken,
    });

    return Array.isArray(data) ? data : (data?.data ?? []);
  } catch (error) {
    console.error("listSavingsRequest error:", error);
    throw error;
  }
};

export const createSavingRequest = async ({
  budgetId,
  amount,
  description,
  type = "LEFTOVER",
  date,
  accessToken,
}) => {
  try {
    if (!budgetId) {
      throw new Error("Budget is required");
    }

    const cleanedAmount = Number(amount);
    if (Number.isNaN(cleanedAmount) || cleanedAmount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const { data } = await fetchWithAuth(`${BASE_URL}/savings`, {
      method: "POST",
      accessToken,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        budgetId,
        amount: cleanedAmount,
        description: description?.trim() || null,
        type,
        date: date || null,
      }),
    });

    return data;
  } catch (error) {
    console.error("createSavingRequest error:", error);
    throw error;
  }
};

export default {
  listSavingsRequest,
  createSavingRequest,
};
