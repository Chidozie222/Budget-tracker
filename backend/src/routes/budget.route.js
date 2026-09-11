import { Router } from "express";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { create_Budget } from "../controllers/budget.controller.js";

const budget = Router();

budget.post("/", authenticate, asyncHandler(create_Budget));

export default budget;
