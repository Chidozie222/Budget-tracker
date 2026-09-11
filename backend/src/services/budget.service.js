import { create_Budget } from "../repositories/budget.repository.js";

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
