import { db } from "../config/db.js";

let expenseRepository;

const createExpense = async (budgetId, categoryId, name, amount) => {
  const result = await db.query(
    `
        INSERT INTO fixed_expenses (budget_id, category_id, name, amount, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
        `,
    [budgetId, categoryId, name, amount],
  );

  return result.rows;
};

const listAllExpenses = async (budgetId) => {
  const result = await db.query(
    `
        SELECT * FROM fixed_expenses WHERE budget_id=$1 ORDER BY name ASC
        `,
    [budgetId],
  );

  return result.rows;
};

export default expenseRepository = { createExpense, listAllExpenses };
