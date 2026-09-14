import { db } from "../config/db.js";

const categoryRepository;

const createCategory = async (budgetId, name) => {
  const result = await db.query(
    `
        INSERT INTO categories (budget_id, name, owner_type, created_at, updated_at)
        VALUES ($1, $2, USER, NOW(), NOW())
        RETURNING *
        `,
    [budgetId, name],
  );

  return result.rows[0];
};


// const listAllCategory = async () => {


// }