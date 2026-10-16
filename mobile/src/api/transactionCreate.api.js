import { BASE_URL } from "./shareDate.api";

export const createTransactionRequest = async ({
  budgetId,
  categoryId,
  amount,
  description,
  accessToken,
}) => {
  try {
    const cleanedAmount = Number(amount);

    if (!budgetId || !categoryId || Number.isNaN(cleanedAmount) || cleanedAmount <= 0) {
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

export default { createTransactionRequest };
