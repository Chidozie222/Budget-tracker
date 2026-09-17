import { db } from "../config/db.js";

let transactionRepository;

const createTransaction = async (budgetId, categoryId, amount, description) => {
  const result = await db.query(
    `
        INSERT INTO transactions (budget_id, category_id, amount, description, date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW(),NOW())
        RETURNING *
        `,
    [budgetId, categoryId, amount, description],
  );

  return result.rows;
};

const listAllTransactionAndFilter = async (budgetId, categoryId, date) => {
  const result = await db.query(
    `
        SELECT * FROM transactions WHERE
        budget_id=$1 AND (($2::INTEGER IS NULL AND $3::DATE IS NULL) OR category_id=$2::INTEGER OR date=$3::DATE)
        `,
    [budgetId, categoryId, date],
  );

  return result.rows;
};

const getTotalExpensesFromPerviousDay = async (budgetId, currentDate) => {
  console.log(budgetId, currentDate);
  const result = await db.query(
    `
    SELECT COALESCE(SUM(amount), 0) AS total FROM transactions
    WHERE budget_id=$1 AND date < $2
    `,
    [budgetId, currentDate],
  );

  return parseFloat(result.rows[0].total);
};

const getTotalExpensesFromCurrentDay = async (budgetId, currentDate) => {
  const result = await db.query(
    `
    SELECT COALESCE(SUM(amount), 0) AS total FROM transactions
    WHERE budget_id=$1 AND date=$2
    `,
    [budgetId, currentDate],
  );

  return parseFloat(result.rows[0].total);
};

export default transactionRepository = {
  createTransaction,
  listAllTransactionAndFilter,
  getTotalExpensesFromPerviousDay,
  getTotalExpensesFromCurrentDay,
};
