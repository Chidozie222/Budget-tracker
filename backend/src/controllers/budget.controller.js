import BudgetService from "../services/budget.service.js";
import { GetUserById } from "../services/user.service.js";

let BudgetController;

const createBudget = async (req, res) => {
  const { name, income, end_date } = req.body;

  let checkIfUserExists = await GetUserById(req.user.userId);

  if (!checkIfUserExists) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  let result = await BudgetService.createBudget(req.user.userId, name, income, end_date);

  res.status(result.statusCode).json(result.data);
};

const getAllBudgets = async (req, res) => {
  let result = await BudgetService.getAllBudget(req.user.userId);

  res.status(result.statusCode).json(result.data);
};

const getBudget = async (req, res) => {
  const { budgetId } = req.params;

  if (budgetId < 0) {
    return res.status(400).json({ message: "Please provide a budget Id" });
  }

  let result = await BudgetService.getBudget(budgetId, req.user.userId);

  res.status(result.statusCode).json(result.data);
};

export default BudgetController = { createBudget, getAllBudgets, getBudget };