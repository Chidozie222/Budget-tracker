import { create } from "zustand";

import { activeBudgetRequest, getBudgetsRequest } from "../api/budget.api";
import {
  logoutRequest,
  refreshTokenRequest,
  signinRequest,
  signupRequest,
} from "../api/auth.api";
import { dailySummaryRequest } from "../api/dailysummary.api";
import { getCategoriesRequest } from "../api/category.api";
import { getTransactionByBudgetRequest } from "../api/transaction.api";

const initialState = {
  isLogin: false,
  user: null,
  isLoading: false,
  error: null,
  activeBudget: null,
  dailySummary: null,
  transactions: [],
  budgets: [],
  categories: [],
};

export const useAppStore = create((set, get) => ({
  ...initialState,

  setActiveBudget: (budget) => set({ activeBudget: budget || null }),
  setDailySummary: (summary) => set({ dailySummary: summary || null }),
  setTransactions: (list) =>
    set({ transactions: Array.isArray(list) ? list : [] }),
  setBudgets: (list) => set({ budgets: Array.isArray(list) ? list : [] }),
  setCategories: (list) => set({ categories: Array.isArray(list) ? list : [] }),

  setLoading: (value) => set({ isLoading: value }),
  setError: (value) => set({ error: value }),

  loadBudgets: async (accessToken) => {
    if (!accessToken) {
      set({ budgets: [] });
      return [];
    }

    try {
      const data = await getBudgetsRequest(accessToken);
      const budgets = Array.isArray(data) ? data : [];
      set({ budgets });
      return budgets;
    } catch (error) {
      set({ budgets: [] });
      throw error;
    }
  },

  loadCategoriesForActiveBudget: async (accessToken, budgetId) => {
    if (!accessToken) {
      set({ categories: [] });
      return [];
    }

    try {
      const categories = await getCategoriesRequest(
        accessToken,
        budgetId ?? null,
      );
      const normalized = Array.isArray(categories) ? categories : [];
      set({ categories: normalized });
      return normalized;
    } catch (error) {
      set({ categories: [] });
      throw error;
    }
  },

  loadActiveBudgetSnapshot: async (accessToken) => {
    if (!accessToken) {
      set({ activeBudget: null, dailySummary: null, transactions: [] });
      return null;
    }

    try {
      const date = new Date().toISOString().slice(0, 10);
      const activeResponse = await activeBudgetRequest(accessToken);
      const active = Array.isArray(activeResponse)
        ? activeResponse[0]
        : activeResponse;

      set({ activeBudget: active || null });

      if (!active?.id) {
        set({ dailySummary: null, transactions: [] });
        return null;
      }

      const summary = await dailySummaryRequest(active.id, date, accessToken);
      const transactions = await getTransactionByBudgetRequest(
        active.id,
        date,
        10,
        0,
        accessToken,
      );

      set({
        dailySummary: summary || null,
        transactions: Array.isArray(transactions) ? transactions : [],
      });

      return {
        activeBudget: active,
        dailySummary: summary || null,
        transactions: Array.isArray(transactions) ? transactions : [],
      };
    } catch (error) {
      set({ activeBudget: null, dailySummary: null, transactions: [] });
      throw error;
    }
  },

  signUp: async (name, email, password) => {
    set({ isLoading: true, error: null });

    try {
      const data = await signupRequest(name, email, password);
      set({
        isLogin: true,
        user: data?.data ?? data,
        error: null,
      });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const data = await signinRequest(email, password);
      set({
        isLogin: true,
        user: data?.data ?? data,
        error: null,
      });
      return data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  refreshAccessToken: async () => {
    const currentUser = get().user;

    if (!currentUser?.refreshToken) {
      return null;
    }

    try {
      const data = await refreshTokenRequest(currentUser.refreshToken);
      const nextAccessToken = data?.data ?? data;

      set((state) => ({
        user: {
          ...(state.user || {}),
          accessToken: nextAccessToken,
        },
      }));

      return nextAccessToken;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  signOut: async () => {
    const currentUser = get().user;

    try {
      if (currentUser?.refreshToken) {
        await logoutRequest(currentUser.refreshToken);
      }
    } catch (error) {
      console.warn("Logout request failed:", error.message);
    } finally {
      set({ ...initialState });
    }
  },
}));
