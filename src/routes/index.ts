import { Router } from "express";
import tokenMiddleware from "../middlewares/token.middleware";
import { authRouter } from "./auth.routes";
import { peopleRouter } from "./people.routes";
import { roomRouter } from "./room.routes";
import { userRouter } from "./user.routes";

const router = Router();

router.use("/auth", authRouter);

router.use(tokenMiddleware);

router.use("/user", userRouter);
router.use("/rooms", roomRouter);
router.use("/people", peopleRouter);

export { router };
