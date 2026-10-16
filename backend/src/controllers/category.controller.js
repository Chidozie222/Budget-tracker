import categoryService from "../services/category.service.js";

let categoryController;

const createCategory = async (req, res) => {
  const { budgetId, name } = req.body;

  const result = await categoryService.createCategory(budgetId, name);

  res.status(result.statusCode).json(result.data);
};

const listAllCategory = async (req, res) => {
  const budgetId = req.params?.budgetId ?? req.query?.budgetId ?? null;

  let result = await categoryService.listAllCategory(budgetId);

  res.status(result.statusCode).json(result.data);
};

export default categoryController = { createCategory, listAllCategory };
