import { db } from "../config/db.js";

export const post_user = async (name, email, password) => {
  const result = await db.query(
    `
        INSERT INTO users (name, email, password, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING name, email, created_at, updated_at
        `,
    [name, email, password],
  );

  return result.rows[0];
};
