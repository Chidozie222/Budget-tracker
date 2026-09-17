import savingService from "../services/saving.service.js";

let savingController;

const createSaving = async (req, res) => {
  const budgetId = req.params.budgetId ?? req.body.budgetId;
  const { amount, description, type, date } = req.body;

  const result = await savingService.createSaving(
    budgetId,
    amount,
    description,
    type,
    date,
  );

  res.status(result.statusCode).json(result.data);
};

const listAllSaving = async (req, res) => {
  const budgetId = req.params.budgetId ?? req.query.budgetId;

  const result = await savingService.listAllSaving(budgetId);

  res.status(result.statusCode).json(result.data);
};

export default savingController = { createSaving, listAllSaving };
