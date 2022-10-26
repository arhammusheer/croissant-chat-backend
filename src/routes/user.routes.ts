import { Router } from "express";

import { user } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/profile", user.profile);

export { userRouter };
