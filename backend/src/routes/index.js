import { Router } from "express";
import auth from "./auth.route.js";
import budget from "./budget.route.js";
import category from "./category.route.js";
import expense from "./expense.route.js";

const routes = Router();

routes.use("/auth", auth);
routes.use("/budgets", budget);
routes.use("/categories", category);
routes.use("/expenses", expense);

export default routes;
