import {
  createBudget,
  get_all_budget,
  get_Budget,
} from "../services/budget.service.js";
import { GetUserById } from "../services/user.service.js";

export const create_Budget = async (req, res) => {
  const { name, income, end_date } = req.body;

  let checkIfUserExists = await GetUserById(req.user.userId);

  if (!checkIfUserExists) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  let result = await createBudget(req.user.userId, name, income, end_date);

  res.status(result.statusCode).json(result.data);
};

export const getAllBudgets = async (req, res) => {
  let result = await get_all_budget(req.user.userId);

  res.status(result.statusCode).json(result.data);
};

export const getBudget = async (req, res) => {
  const { budgetId } = req.params;

  if (budgetId < 0) {
    return res.status(400).json({ message: "Please provide a budget Id" });
  }

  let result = await get_Budget(budgetId, req.user.userId);

  res.status(result.statusCode).json(result.data);
};
