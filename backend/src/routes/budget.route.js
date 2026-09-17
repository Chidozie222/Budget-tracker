import { Router } from "express";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import BugetController from "../controllers/budget.controller.js";
import savingController from "../controllers/saving.controller.js";

const budget = Router();

budget.post("/", authorize, asyncHandler(BugetController.createBudget));
budget.get("/", authorize, asyncHandler(BugetController.getAllBudgets));
budget.get(
  "/:budgetId",
  authorize,
  asyncHandler(BugetController.getBudgetById),
);
budget.post(
  "/:budgetId/savings",
  authorize,
  asyncHandler(savingController.createSaving),
);
budget.get(
  "/:budgetId/savings",
  authorize,
  asyncHandler(savingController.listAllSaving),
);

export default budget;
