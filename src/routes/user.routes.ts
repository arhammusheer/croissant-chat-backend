import { Router } from "express";

import { user } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/profile", user.profile);
userRouter.patch("/randomize-emoji", user.randomizeEmoji);

userRouter.get("/locations", user.getLocationLogs);
userRouter.post("/locations", user.addLocationLog);

export { userRouter };
