import { Router } from "express";
import auth from "./auth.route.js";

const routes = Router();


routes.use("/auth", auth);

export default routes;