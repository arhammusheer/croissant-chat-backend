import { Router } from "express";
import { auth } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/login", auth.login);
authRouter.post("/register", auth.register);

export { authRouter };
