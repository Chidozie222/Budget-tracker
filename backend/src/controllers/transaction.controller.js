import transactionService from "../services/transaction.service.js";

let transactionController;

const createTransaction = async (req, res) => {
  const { budgetId, categoryId, amount, description } = req.body;

  const result = await transactionService.createTransaction(
    budgetId,
    categoryId,
    amount,
    description,
  );

  res.status(result.statusCode).json(result.data);
};

const listAllTransactionAndFilter = async (req, res) => {
  const { budgetId } = req.params;

  const categoryId = req.query?.categoryId ?? null;
  const date = req.query.date ? new Date(req.query.date) : null;

  const result = await transactionService.listAllTransactionAndFilter(
    budgetId,
    categoryId,
    date,
  );

  res.status(result.statusCode).json(result.data);
};

export default transactionController = {
  createTransaction,
  listAllTransactionAndFilter,
};
