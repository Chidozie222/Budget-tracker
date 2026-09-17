import { db } from "../config/db.js";

let budgetRepository;

const createBudget = async (user_id, name, income, end_date) => {
  const result = await db.query(
    `
        INSERT INTO budgets (user_id, name, income, start_date, end_date, created_at, updated_at)
        VALUES ($1, $2, $3, CURRENT_DATE, $4, NOW(), NOW())
        RETURNING *
        `,
    [user_id, name, income, end_date],
  );

  return result.rows[0];
};

const getAllBudget = async (userId) => {
  const result = await db.query(
    `
    SELECT * FROM budgets WHERE user_id=$1 ORDER BY start_date DESC
    `,
    [userId],
  );

  return result.rows;
};

const getBudgetById = async (id) => {
  const result = await db.query(
    `
    SELECT * FROM budgets WHERE id=$1
    `,
    [id],
  );

  return result.rows[0];
};

export default budgetRepository = { createBudget, getAllBudget, getBudgetById };
