import BudgetRepository from "../repositories/budget.repository.js";
import { validDataFormat, validName } from "../utils/vaildation.js";

let BudgetService;

const createBudget = async (user_id, name, income, end_date) => {
  if (!validName(name) || income == null) {
    return {
      statusCode: 400,
      data: {
        message: "Please name and income are required",
      },
    };
  }

  if (!validDataFormat(end_date)) {
    return {
      statausCode: 400,
      data: {
        message: "Please provide the correct data format YYYY-MM-DD",
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

const getBudgetById = async (budgetId) => {
  if (budgetId == null) {
    return {
      statusCode: 400,
      data: {
        message: "Please provide the budget Id",
      },
    };
  }

  let result = await BudgetRepository.getBudgetById(budgetId);

  return {
    statusCode: 200,
    data: result,
  };
};

export default BudgetService = { createBudget, getAllBudget, getBudgetById };
