import { Router } from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";
import savingController from "../controllers/saving.controller.js";

const saving = Router();

saving.post("/", authorize, asyncHandler(savingController.createSaving));
saving.get(
  "/:budgetId",
  authorize,
  asyncHandler(savingController.listAllSaving),
);

export default saving;
