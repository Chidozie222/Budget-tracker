import { Router } from "express";
import auth from "./auth.route.js";
import budget from "./budget.route.js";

const routes = Router();

routes.use("/auth", auth);
routes.use("/budgets", budget);

export default routes;
