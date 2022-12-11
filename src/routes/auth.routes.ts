import { Router } from "express";
import { auth } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/login", auth.login);
authRouter.post("/register", auth.register);
authRouter.post("/passwordless", auth.passwordless);
authRouter.get("/passwordless/callback", auth.passwordlessCallback);

authRouter.get("/google", auth.google);

export { authRouter };
