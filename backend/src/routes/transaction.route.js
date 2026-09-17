import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";
import transactionController from "../controllers/transaction.controller.js";

const transaction = Router();

transaction.post(
  "/",
  authorize,
  asyncHandler(transactionController.createTransaction),
);

transaction.get(
  "/:budgetId",
  authorize,
  asyncHandler(transactionController.listAllTransactionAndFilter),
);

export default transaction;
