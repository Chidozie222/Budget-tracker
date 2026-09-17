import { Router } from "express";
import auth from "./auth.route.js";
import budget from "./budget.route.js";
import category from "./category.route.js";
import expense from "./expense.route.js";
import transaction from "./transaction.route.js";
import saving from "./saving.route.js";
import dailySummary from "./dailySummary.route.js";

const routes = Router();

routes.use("/auth", auth);
routes.use("/budgets", budget);
routes.use("/categories", category);
routes.use("/expenses", expense);
routes.use("/transactions", transaction);
routes.use("/savings", saving);
routes.use("/dailySummaries", dailySummary);

export default routes;
