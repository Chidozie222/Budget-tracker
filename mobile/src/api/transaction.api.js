import { BASE_URL } from "./shareDate.api";

export const getTransactionByBudgetRequest = async (
  budgetId,
  date = null,
  take = null,
  skip = null,
  accessToken
) => {
  try {
    if (date === null) {
      throw new Error("Date must be provided");
    }

    let url =
      take === null && skip === null
        ? `${BASE_URL}/transactions/trans/${budgetId}`
        : `${BASE_URL}/transactions/trans/${budgetId}?take=${take}&skip=${skip}`;

    let response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Something is wrong");
    }

    return data;
  } catch (error) {
    console.log("GetTransactionByBudgetRequest:", error);
    throw error;
  }
};
