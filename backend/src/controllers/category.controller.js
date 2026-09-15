import categoryService from "../services/category.service.js";

let categoryController;

const createCategory = async (req, res) => {
  const { budgetId, name } = req.body;

  const result = await categoryService.createCategory(budgetId, name);

  res.status(result.statusCode).json(result.data);
};

const listAllCategory = async (req, res) => {
  let result = await categoryService.listAllCategory(req.params?.budgetId);

  res.status(result.statusCode).json(result.data);
};

export default categoryController = { createCategory, listAllCategory };
