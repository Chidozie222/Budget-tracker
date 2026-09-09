import { Router } from "express";
import { signUp } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";

const auth = Router();

auth.post("/sign-up", asyncHandler(signUp));


export default auth;