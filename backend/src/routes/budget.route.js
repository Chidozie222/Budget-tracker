import { Router } from "express";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import {
  create_Budget,
  getAllBudgets,
  getBudget,
} from "../controllers/budget.controller.js";

const budget = Router();

budget.post("/", authorize, asyncHandler(create_Budget));
budget.get("/", authorize, asyncHandler(getAllBudgets));
budget.get("/:budgetId", authorize, asyncHandler(getBudget));

export default budget;
