import { db } from "../config/db.js";

const insertCategories = async () => {
  const categories = [
    "Food",
    "Transportation",
    "Housing",
    "Traveling",
    "Academics",
    "Borrow",
  ];

  try {
    await db.query(
      "ALTER TABLE categories ALTER COLUMN budget_id DROP NOT NULL;",
    );

    for (const category of categories) {
      await db.query(
        `
                INSERT INTO categories (name, owner_type, created_at, updated_at)
                VALUES ($1, $2, NOW(), NOW());
            `,
        [category, "ADMIN"],
      );
    }

    console.log("Category added successfully successfully.");
  } catch (err) {
    // console.error(err);
    console.error("Failed to apply schema:", err.message);
  } finally {
    await db.end();
  }
};

insertCategories();
