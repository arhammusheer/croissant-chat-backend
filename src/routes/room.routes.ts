import { Router } from "express";
import { chat } from "../controllers/chat.controller";
import { room } from "../controllers/room.controller";

const roomRouter = Router();

roomRouter.post("/", room.create);
roomRouter.get("/", room.getRooms);

roomRouter.get("/:roomId/messages", chat.getRecentMessages);
roomRouter.post("/:roomId/messages", chat.sendMessage);

roomRouter.put("/:roomId/messages/:messageId", chat.editMessage);
roomRouter.delete("/:roomId/messages/:messageId", chat.deleteMessage);

export { roomRouter };
