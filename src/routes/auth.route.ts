import { Router } from "express";
import { signupUser } from "../controllers/auth/signupUser.js";
import { loginUser } from "../controllers/auth/loginUser.js";

export const authRoutes = Router();

authRoutes.post("/signup", signupUser);
authRoutes.post("/login", loginUser);
