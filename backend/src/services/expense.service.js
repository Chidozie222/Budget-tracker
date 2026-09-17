import budgetRepository from "../repositories/budget.repository.js";
import categoryRepository from "../repositories/category.repository.js";
import expenseRepository from "../repositories/expense.repository.js";
import { validName } from "../utils/validation.js";

let expenseService;

const createExpense = async (expenses) => {
  if (!Array.isArray(expenses) || expenses.length <= 0) {
    return {
      statusCode: 400,
      data: { message: "The array must be greater than zero" },
    };
  }

  let errors = [];
  let validExpenses = [];

  for (let i = 0; i < expenses.length; i++) {
    const { name, amount, budgetId, categoryId } = expenses[i];
    let itemErrors = [];

    if (!validName(name)) {
      itemErrors.push(`Item ${i}: Name is required`);
    }

    if (amount === null || amount === undefined || amount <= 0) {
      itemErrors.push(`Item ${i}: Amount must be greater than 0`);
    }

    if (
      budgetId === null ||
      budgetId === undefined ||
      categoryId === null ||
      categoryId === undefined
    ) {
      itemErrors.push(`Item ${i}: budget id and category id are required`);
    } else {
      const doesBudgetIdExist = await budgetRepository.getBudgetById(budgetId);
      const doesCategoryIdExist =
        await categoryRepository.getCategoryById(categoryId);

      if (!doesBudgetIdExist || !doesCategoryIdExist) {
        itemErrors.push(`Item ${i}: budget id or category id is not valid`);
      }
    }

    if (itemErrors.length > 0) {
      errors.push(...itemErrors);
    } else {
      validExpenses.push({ name, amount, budgetId, categoryId });
    }
  }

  if (errors.length > 0) {
    return {
      statusCode: 400,
      data: {
        message: "Validation failed for one or more expenses in the array",
        data: errors,
      },
    };
  }

  const result = await Promise.all(
    validExpenses.map((item) =>
      expenseRepository.createExpense(
        item.budgetId,
        item.categoryId,
        item.name,
        item.amount,
      ),
    ),
  );

  // const result = validExpenses;

  return {
    statusCode: 201,
    data: {
      message: "expenses created successfully",
      data: result[0],
    },
  };
};

const listAllExpenses = async (budgetId) => {
  if (budgetId === null || budgetId === undefined) {
    return {
      statusCode: 400,
      data: {
        message: "budget Id must be given",
      },
    };
  }

  const result = await expenseRepository.listAllExpenses(budgetId);

  return {
    statusCode: 200,
    data: result,
  };
};

export default expenseService = { createExpense, listAllExpenses };
