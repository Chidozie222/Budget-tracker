import { BASE_URL } from "./shareDate.api";

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
