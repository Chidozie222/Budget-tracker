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
  let query = `SELECT * FROM transactions WHERE budget_id = $1`;
  const params = [budgetId];

  if (categoryId !== null && categoryId !== undefined && categoryId !== "") {
    query += ` AND category_id = $${params.length + 1}`;
    params.push(categoryId);
  }

  if (date) {
    query += ` AND date = $${params.length + 1}::DATE`;
    params.push(date);
  }

  const result = await db.query(query, params);
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

const getTransactionByBudget = async (budgetId, currentDate, take, skip) => {
  let query = `SELECT transactions.*, categories.name FROM transactions
  INNER JOIN categories ON transactions.category_id = categories.id
  WHERE transactions.budget_id = $1 `;

  const params = [budgetId];

  if (currentDate !== null) {
    query += `AND date = $${params.length + 1}::DATE`;
    params.push(currentDate);
  }

  query += ` ORDER BY transactions.id DESC`;

  if (take !== null && take !== undefined && take !== "") {
    query += ` LIMIT $${params.length + 1}`;
    params.push(Number(take));
  }

  if (skip !== null && skip !== undefined && skip !== "") {
    query += ` OFFSET $${params.length + 1}`;
    params.push(Number(skip));
  }

  const result = await db.query(query, params);
  return result.rows;
};

export default transactionRepository = {
  createTransaction,
  listAllTransactionAndFilter,
  getTotalExpensesFromPerviousDay,
  getTotalExpensesFromCurrentDay,
  getTransactionByBudget,
};
