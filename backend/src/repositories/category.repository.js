import { db } from "../config/db.js";

let categoryRepository;

const createCategory = async (budgetId, name) => {
  const result = await db.query(
    `
        INSERT INTO categories (budget_id, name, owner_type, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *
        `,
    [budgetId, name, "USER"],
  );

  return result.rows[0];
};

const listAllCategory = async (budgetId) => {
  const result = await db.query(
    `
    SELECT * FROM categories WHERE owner_type=$1 OR budget_id=$2
    `,
    ["ADMIN", budgetId],
  );

  return result.rows;
};

const getCategoryById = async (categoryId) => {
  const result = await db.query(
    `
    SELECT * FROM categories WHERE id=$1
    `,
    [categoryId],
  );

  return result.rows;
};

export default categoryRepository = { createCategory, listAllCategory, getCategoryById };
