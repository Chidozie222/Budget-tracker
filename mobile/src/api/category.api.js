import { BASE_URL, fetchWithAuth } from "./shareDate.api";

const normalizeCategoryList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.categories)) return data.categories;
  return [];
};

export const getCategoriesRequest = async (accessToken, budgetId = null) => {
  try {
    const urls = [];

    if (budgetId) {
      urls.push(`${BASE_URL}/categories/${budgetId}`);
    }

    urls.push(`${BASE_URL}/categories`);

    const combined = [];
    const seen = new Set();

    for (const url of urls) {
      const { data } = await fetchWithAuth(url, {
        method: "GET",
        accessToken,
      });

      const list = normalizeCategoryList(data);

      for (const item of list) {
        const key =
          item?.id ??
          `${item?.name ?? "category"}-${item?.budget_id ?? "system"}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }
    }

    return combined;
  } catch (error) {
    console.error("getCategoriesRequest error:", error);
    throw error;
  }
};

export const createCategoryRequest = async (budgetId, name, accessToken) => {
  try {
    const trimmedName = String(name || "").trim();

    if (!budgetId || !trimmedName) {
      throw new Error("Budget and category name are required");
    }

    const { data } = await fetchWithAuth(`${BASE_URL}/categories`, {
      method: "POST",
      accessToken,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        budgetId,
        name: trimmedName,
      }),
    });

    return data;
  } catch (error) {
    console.error("createCategoryRequest error:", error);
    throw error;
  }
};

export default {
  getCategoriesRequest,
  createCategoryRequest,
};
