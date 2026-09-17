import budgetRepository from "../repositories/budget.repository.js";
import savingRepository from "../repositories/saving.repository.js";
import { validDataFormat } from "../utils/validation.js";

let SavingService;

const validTypes = ["PLANNED", "LEFTOVER"];

const createSaving = async (budgetId, amount, description, type, date) => {
  if (budgetId === null || budgetId === undefined) {
    return {
      statusCode: 400,
      data: {
        message: "budget id is required",
      },
    };
  }

  const budgetExists = await budgetRepository.getBudgetById(budgetId);

  if (!budgetExists) {
    return {
      statusCode: 404,
      data: {
        message: "Budget not found",
      },
    };
  }

  if (amount === null || amount === undefined || Number(amount) <= 0) {
    return {
      statusCode: 400,
      data: {
        message: "Amount must be greater than 0",
      },
    };
  }

  if (type !== undefined && type !== null && !validTypes.includes(type)) {
    return {
      statusCode: 400,
      data: {
        message: "Saving type must be either PLANNED or LEFTOVER",
      },
    };
  }

  if (date !== undefined && date !== null && !validDataFormat(date)) {
    return {
      statusCode: 400,
      data: {
        message: "Please provide the correct data format YYYY-MM-DD",
      },
    };
  }

  const result = await savingRepository.createSaving(
    budgetId,
    Number(amount),
    description ?? null,
    type ?? "LEFTOVER",
    date ?? null,
  );

  return {
    statusCode: 201,
    data: {
      message: "Saving created successfully",
      data: result,
    },
  };
};

const listAllSaving = async (budgetId) => {
  if (budgetId === null || budgetId === undefined) {
    return {
      statusCode: 400,
      data: {
        message: "budget id is required",
      },
    };
  }

  const budgetExists = await budgetRepository.getBudgetById(budgetId);

  if (!budgetExists) {
    return {
      statusCode: 404,
      data: {
        message: "Budget not found",
      },
    };
  }

  const result = await savingRepository.listAllSavingByBudget(budgetId);

  return {
    statusCode: 200,
    data: result,
  };
};

export default SavingService = { createSaving, listAllSaving };
