import { BASE_URL, fetchWithAuth } from "./shareDate.api";

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

export default { createTransactionRequest };
