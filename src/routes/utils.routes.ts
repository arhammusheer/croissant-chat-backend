import { Router } from "express";
import { utils } from "../controllers/utils.controller";

const utilsRouter = Router();

utilsRouter.get("/geoip", utils.geoip);

export { utilsRouter };