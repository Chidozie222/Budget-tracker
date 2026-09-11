import { db } from "../config/db.js";

export const create_Budget = async (user_id, name, income, end_date) => {
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
