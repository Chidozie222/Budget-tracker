import budgetRepository from "../repositories/budget.repository.js";
import categoryRepository from "../repositories/category.repository.js";
import { validName } from "../utils/vaildation.js";

let categoryService;

const createCategory = async (budgetId, name) => {
  if (!validName(name)) {
    return {
      statusCode: 400,
      data: {
        message: "Please name is required",
      },
    };
  }

  const checkIfBudgetIdIsValid = await budgetRepository.getBudgetById(budgetId);

  if (!checkIfBudgetIdIsValid) {
    return {
      statusCode: 400,
      data: {
        message: "Budget Id does not exists",
      },
    };
  }

  let result = await categoryRepository.createCategory(budgetId, name);

  return {
    statusCode: 201,
    data: {
      message: "category created successfully",
      data: result,
    },
  };
};

const listAllCategory = async (budgetId) => {
  const result = await categoryRepository.listAllCategory(budgetId);

  return {
    statusCode: 201,
    data: result,
  };
};

export default categoryService = { createCategory, listAllCategory };
