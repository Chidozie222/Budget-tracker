import transactionRepository from "../repositories/transaction.repository.js";
import budgetRepository from "../repositories/budget.repository.js";
import categoryRepository from "../repositories/category.repository.js";

let transactionService;

const createTransaction = async (budgetId, categoryId, amount, description) => {
  if (
    budgetId === null ||
    budgetId === undefined ||
    categoryId === null ||
    categoryId === undefined
  ) {
    return {
      statusCode: 400,
      data: {
        message: "budget id and category id are required",
      },
    };
  }

  const doesBudgetIdExist = await budgetRepository.getBudgetById(budgetId);
  const doesCategoryIdExist =
    await categoryRepository.getCategoryById(categoryId);

  if (!doesBudgetIdExist || !doesCategoryIdExist) {
    return {
      statusCode: 400,
      data: {
        message: "budget id or category id is not valid",
      },
    };
  }

  if (amount === null || amount === undefined || amount <= 0) {
    return {
      statusCode: 400,
      data: {
        message: "Amount must be greater than 0",
      },
    };
  }

  let _description = description ?? null;

  const result = await transactionRepository.createTransaction(
    budgetId,
    categoryId,
    amount,
    _description,
  );

  return {
    statusCode: 201,
    data: result,
  };
};

const listAllTransactionAndFilter = async (budgetId, categoryId, date) => {
  if (budgetId === null || budgetId === undefined) {
    return {
      statusCode: 400,
      data: {
        message: "budget id is required",
      },
    };
  }

  const result = await transactionRepository.listAllTransactionAndFilter(
    budgetId,
    categoryId,
    date,
  );

  // const result = _date;

  return {
    statusCode: 200,
    data: result,
  };
};

export default transactionService = {
  createTransaction,
  listAllTransactionAndFilter,
};
