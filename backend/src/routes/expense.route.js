import { Router } from "express";
import expenseController from "../controllers/expense.controller.js";
import { authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";

const expense = Router();

expense.post("/", authorize, asyncHandler(expenseController.createExpense));

expense.get(
  "/:budgetId",
  authorize,
  asyncHandler(expenseController.listAllExpense),
);

export default expense