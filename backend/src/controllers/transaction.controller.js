import transactionService from "../services/transaction.service.js";

const normalizeDateParam = (value) => {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const sliced = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(sliced)) {
    return sliced;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
};

let transactionController;

const createTransaction = async (req, res) => {
  const { budgetId, categoryId, amount, description } = req.body;

  const result = await transactionService.createTransaction(
    budgetId,
    categoryId,
    amount,
    description,
  );

  if (result.statusCode === 201 && result.data) {
    const createdTransaction = Array.isArray(result.data)
      ? result.data[0]
      : result.data;

    if (createdTransaction) {
      const io = req.app.locals.io;
      io.to(`budget:${budgetId}`).emit("transaction:created", {
        budgetId,
        transaction: createdTransaction,
      });
    }
  }

  res.status(result.statusCode).json(result.data);
};

const listAllTransactionAndFilter = async (req, res) => {
  const { budgetId } = req.params;

  const categoryId = req.query?.categoryId ?? null;
  const date = normalizeDateParam(req.query.date);

  const result = await transactionService.listAllTransactionAndFilter(
    budgetId,
    categoryId,
    date,
  );

  res.status(result.statusCode).json(result.data);
};

const getTransactionByBudget = async (req, res) => {
  const { budgetId } = req.params;

  const date = normalizeDateParam(req.query.date);
  const take = req.query?.take;
  const skip = req.query?.skip;

  const result = await transactionService.getTransactionByBudget(
    budgetId,
    date,
    take,
    skip,
  );

  res.status(result.statusCode).json(result.data);
};

export default transactionController = {
  createTransaction,
  listAllTransactionAndFilter,
  getTransactionByBudget,
};
