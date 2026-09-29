import budgetRepository from "../repositories/budget.repository.js";
import { validDataFormat, validName } from "../utils/validation.js";

let budgetService;

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

  let checkIfActiveBudget = await budgetRepository.getActiveBudget(user_id);

  console.log(checkIfActiveBudget);

  if (checkIfActiveBudget !== undefined) {
    return {
      statausCode: 400,
      data: {
        message: "There is an active budget already",
      },
    };
  }

  let result = await budgetRepository.createBudget(
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

const getActiveBudget = async (userId) => {
  let result = await budgetRepository.getActiveBudget(userId);

  if (result === undefined) {
    return {
      statusCode: 200,
      data: [],
    };
  }

  return {
    statusCode: 200,
    data: result,
  };
};

const getAllBudget = async (userId) => {
  let result = await budgetRepository.getAllBudget(userId);

  return {
    statusCode: 200,
    data: result,
  };
};

const getBudgetById = async (budgetId) => {
  if (budgetId === null || budgetId === undefined) {
    return {
      statusCode: 400,
      data: {
        message: "budget Id must be given",
      },
    };
  }

  let result = await budgetRepository.getBudgetById(budgetId);

  return {
    statusCode: 200,
    data: result,
  };
};

export default budgetService = {
  createBudget,
  getAllBudget,
  getActiveBudget,
  getBudgetById,
};
