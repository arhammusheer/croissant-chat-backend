import { Router } from "express";
import { people } from "../controllers/people.controller";

const peopleRouter = Router();

peopleRouter.get("/:id", people.getProfile);

export { peopleRouter };
