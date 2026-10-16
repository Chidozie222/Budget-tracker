import { BASE_URL } from "./shareDate.api";

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
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        continue;
      }

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

    const response = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        budgetId,
        name: trimmedName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to create category");
    }

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
