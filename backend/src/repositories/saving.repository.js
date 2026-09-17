import { db } from "../config/db.js";

let savingRepository;

const createSaving = async (budgetId, amount, description, type, date) => {
  const savingDate = date ?? new Date().toISOString().slice(0, 10);

  const result = await db.query(
    `
      INSERT INTO savings (budget_id, amount, description, type, date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `,
    [budgetId, amount, description ?? null, type ?? "LEFTOVER", savingDate],
  );

  return result.rows[0];
};

const listAllSavingByBudget = async (budgetId) => {
  const result = await db.query(
    `
      SELECT * FROM savings
      WHERE budget_id = $1
      ORDER BY date DESC, created_at DESC
    `,
    [budgetId],
  );

  return result.rows;
};

const getTotalPlannedSavings = async (budgetId) => {
  const result = await db.query(
    `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM savings
      WHERE budget_id = $1 AND type = 'PLANNED'
    `,
    [budgetId],
  );

  return parseFloat(result.rows[0].total);
};

export default savingRepository = {
  createSaving,
  listAllSavingByBudget,
  getTotalPlannedSavings,
};
