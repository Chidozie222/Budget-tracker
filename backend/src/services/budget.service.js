import {
  create_Budget,
  getAllBudget,
  getBudgetById,
} from "../repositories/budget.repository.js";

export const createBudget = async (user_id, name, income, end_date) => {
  if ((name === null || income === null, end_date === null)) {
    return {
      statusCode: 400,
      data: {
        message: "Please name, income and end date are required",
      },
    };
  }

  let result = await create_Budget(user_id, name, income, end_date);

  return {
    statusCode: 201,
    data: {
      message: "Budget created successfully",
      data: result,
    },
  };
};

export const get_all_budget = async (userId) => {
  let result = await getAllBudget(userId);

  return {
    statusCode: 200,
    data: result,
  };
};

export const get_Budget = async (budgetId, userId) => {
  if (budgetId < 0) {
    return {
      statusCode: 400,
      data: {
        message: "Please provide the budget Id",
      },
    };
  }

  let result = await getBudgetById(budgetId, userId);

  return {
    statusCode: 200,
    data: result,
  };
};
