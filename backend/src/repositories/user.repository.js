import { db } from "../config/db.js";

export const post_user = async (name, email, password) => {
  const result = await db.query(
    `
        INSERT INTO users (name, email, password, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, name, email, created_at, updated_at
        `,
    [name, email, password],
  );

  return result.rows[0];
};

export const findByEmail = async (email) => {
  const result = await db.query(
    `
      SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  return result.rows[0];
};

export const findById = async (id) => {
  const result = await db.query(
    `
      SELECT name FROM users WHERE id=$1
    `,
    [id],
  );

  return result.rows[0];
};

export const storeHashedRefreshToken = async (userId, hash_token) => {
  await db.query(
    `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) VALUES ($1, $2, NOW() + INTERVAL '30 days', NOW())
    `,
    [userId, hash_token],
  );
};

export const findRefreshToken = async (hashed_token) => {
  const result = await db.query(
    `
    SELECT refresh_tokens.*, users.role FROM refresh_tokens
    INNER JOIN users ON refresh_tokens.user_id = users.id
    WHERE refresh_tokens.token_hash=$1 AND refresh_tokens.expires_at > NOW()
    `,
    [hashed_token],
  );

  return result.rows[0];
};

export const findRefreshTokenByUserId = async (id) => {
  const result = await db.query(
    `
    SELECT * FROM refresh_tokens WHERE user_id=$1 AND expires_at > NOW()
    `,
    [id],
  );

  return result.rows[0];
};


export const deleteRefreshToken = async (token) => {
  await db.query(
    `
    DELETE FROM refresh_tokens WHERE token_hash=$1
    `,
    [token]
  );
} 

export const updateRefreshToken = async (userId, token) => {
  await db.query(
    `
    UPDATE refresh_tokens SET token_hash=$1, created_at=NOW()
    WHERE user_id=$2
    `,
    [token, userId],
  );
}
