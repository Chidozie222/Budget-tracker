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
  let result;

  if (!budgetId) {
    result = await db.query(
      `
      SELECT * FROM categories
      WHERE owner_type = 'ADMIN'
      ORDER BY name ASC
      `,
    );
  } else {
    result = await db.query(
      `
      SELECT * FROM categories
      WHERE owner_type = 'ADMIN' OR budget_id = $1
      ORDER BY CASE WHEN owner_type = 'ADMIN' THEN 0 ELSE 1 END, name ASC
      `,
      [budgetId],
    );
  }

  return result.rows;
};

const getCategoryById = async (categoryId) => {
  const result = await db.query(
    `
    SELECT * FROM categories WHERE id=$1
    `,
    [categoryId],
  );

  return result.rows[0];
};

export default categoryRepository = {
  createCategory,
  listAllCategory,
  getCategoryById,
};
