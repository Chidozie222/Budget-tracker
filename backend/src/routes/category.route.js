import { Router } from "express";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";
import { authorize } from "../middleware/auth.middleware.js";
import categoryController from "../controllers/category.controller.js";

const category = Router();

category.post("/", authorize, asyncHandler(categoryController.createCategory));

category.get(
  "/{:budgetId}",
  authorize,
  asyncHandler(categoryController.listAllCategory),
);

export default category;
