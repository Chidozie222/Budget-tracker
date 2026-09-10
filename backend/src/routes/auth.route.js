import { Router } from "express";
import {
  logout,
  refreshAccessToken,
  signin,
  signUp,
} from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/asynchandler.middleware.js";

const auth = Router();

auth.post("/sign-up", asyncHandler(signUp));
auth.post("/login", asyncHandler(signin));
auth.post("/refresh-token", asyncHandler(refreshAccessToken));
auth.delete("/logout/:refreshToken", asyncHandler(logout));

export default auth;
