import BudgetRepository from "../repositories/budget.repository.js";

let BudgetService;

const createBudget = async (user_id, name, income, end_date) => {
  if (!name || income == null || !end_date) {
    return {
      statusCode: 400,
      data: {
        message: "Please name, income and end date are required",
      },
    };
  }

  let result = await BudgetRepository.createBudget(
    user_id,
    name,
    income,
    end_date,
  );

  return {
    statusCode: 201,
    data: {
      message: "Budget created successfully",
      data: result,
    },
  };
};

const getAllBudget = async (userId) => {
  let result = await BudgetRepository.getAllBudget(userId);

  return {
    statusCode: 200,
    data: result,
  };
};

const getBudget = async (budgetId, userId) => {
  if (budgetId == null) {
    return {
      statusCode: 400,
      data: {
        message: "Please provide the budget Id",
      },
    };
  }

  let result = await BudgetRepository.getBudgetById(budgetId, userId);

  return {
    statusCode: 200,
    data: result,
  };
};

export default BudgetService = { createBudget, getAllBudget, getBudget };
