import { BASE_URL } from "./shareDate.api";

export const listSavingsRequest = async (budgetId, accessToken) => {
  try {
    const response = await fetch(`${BASE_URL}/savings/${budgetId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch savings");
    }

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
    console.log(budgetId)
    if (!budgetId) {
      throw new Error("Budget is required");
    }

    const cleanedAmount = Number(amount);
    if (Number.isNaN(cleanedAmount) || cleanedAmount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const response = await fetch(`${BASE_URL}/savings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        budgetId,
        amount: cleanedAmount,
        description: description?.trim() || null,
        type,
        date: date || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to create saving");
    }

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
