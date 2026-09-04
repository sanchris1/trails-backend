import { Router } from "express";
import { signupUser } from "../controllers/auth/signupUser.js";
import { loginUser } from "../controllers/auth/loginUser.js";
import { logoutUser } from "../controllers/auth/logoutUser.js";
import { refresh } from "../controllers/auth/refresh.js";
import { checkUser } from "../middleware/checkUserMiddleware.js";
import { getSession } from "./session/getSession.js";

export const authRoutes = Router();

authRoutes.post("/signup", signupUser);
authRoutes.post("/login", loginUser);
authRoutes.post("/logout", logoutUser);
authRoutes.post("/refresh", refresh);
authRoutes.get("/me", checkUser, getSession);
