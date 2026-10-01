import { BASE_URL } from "./shareDate.api";

export const dailySummaryRequest = async (
  budgetId,
  date = null,
  accessToken,
) => {
  try {
    let url =
      date === null
        ? `${BASE_URL}/dailySummaries/${budgetId}`
        : `${BASE_URL}/dailySummaries/${budgetId}?date=${date}`;
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
    // Let caller handle errors; log here for debugging
    console.error("DailySummaryRequest error:", error);
    throw error;
  }
};
