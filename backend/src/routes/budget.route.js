import { Router } from "express";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import BugetController from "../controllers/budget.controller.js";

const budget = Router();

budget.post("/", authorize, asyncHandler(BugetController.createBudget));
budget.get("/", authorize, asyncHandler(BugetController.getAllBudgets));
budget.get("/:budgetId", authorize, asyncHandler(BugetController.getBudget));

export default budget;
