import { Router } from "express";
import { room } from "../controllers/room.controller";

const roomRouter = Router();

roomRouter.post("/", room.create);
roomRouter.get("/", room.getRooms);

export { roomRouter };
