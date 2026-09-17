import budgetService from "../services/budget.service.js";
import { GetUserById } from "../services/user.service.js";

let budgetController;

const createBudget = async (req, res) => {
  const { name, income, end_date } = req.body;

  let checkIfUserExists = await GetUserById(req.user.userId);

  if (!checkIfUserExists) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  let result = await budgetService.createBudget(
    req.user.userId,
    name,
    income,
    end_date,
  );

  res.status(result.statusCode).json(result.data);
};

const getAllBudgets = async (req, res) => {
  let result = await budgetService.getAllBudget(req.user.userId);

  res.status(result.statusCode).json(result.data);
};

const getBudgetById = async (req, res) => {
  const { budgetId } = req.params;

  if (budgetId < 0) {
    return res.status(400).json({ message: "Please provide a budget Id" });
  }

  let result = await budgetService.getBudgetById(budgetId, req.user.userId);

  res.status(result.statusCode).json(result.data);
};

export default budgetController = {
  createBudget,
  getAllBudgets,
  getBudgetById,
};
