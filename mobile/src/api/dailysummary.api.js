import { BASE_URL, fetchWithAuth } from "./shareDate.api";

export const dailySummaryRequest = async (
  budgetId,
  date = null,
  accessToken,
) => {
  try {
    const url =
      date === null
        ? `${BASE_URL}/dailySummaries/${budgetId}`
        : `${BASE_URL}/dailySummaries/${budgetId}?date=${date}`;

    const { data } = await fetchWithAuth(url, {
      method: "GET",
      accessToken,
    });

    return data;
  } catch (error) {
    console.error("DailySummaryRequest error:", error);
    throw error;
  }
};
