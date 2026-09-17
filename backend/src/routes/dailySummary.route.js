import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";
import dailySummaryController from "../controllers/dailySummary.controller.js";

const dailySummary = Router();

dailySummary.get("/:budgetId", authorize, asyncHandler(dailySummaryController));

export default dailySummary;
