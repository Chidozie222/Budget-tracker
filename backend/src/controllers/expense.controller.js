import expenseService from "../services/expense.service.js";

let expenseController;

const createExpense = async (req, res) => {
  const { expenses } = req.body;
  const result = await expenseService.createExpense(expenses);

  res.status(result.statusCode).json(result.data);
};

const listAllExpense = async (req, res) => {
  const { budgetId } = req.params;
  const result = await expenseService.listAllExpenses(budgetId);

  res.status(result.statusCode).json(result.data);
};

export default expenseController = { createExpense, listAllExpense };
