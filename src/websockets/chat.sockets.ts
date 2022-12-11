import { WebSocketServer } from "ws";
import { redisType } from "../app";
import { ChatRoomManager } from "../services/room.service";

const rooms = new ChatRoomManager();

interface WSMessage {
  type: "join" | "leave";
  roomId: string;
}

interface WSMessageLeaveAll {
  type: "leaveAll";
}

export const initializeWebSockets = (wss: WebSocketServer) => {
  wss.on("connection", (ws) => {
    const ID =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    ws.on("message", (data) => {
      const message: WSMessage | WSMessageLeaveAll = JSON.parse(
        data.toString()
      );

      switch (message.type) {
        case "join":
          // Join room
          rooms.joinRoom(message.roomId, ID, ws);

          break;
        case "leave":
          // Leave room
          rooms.leaveRoom(message.roomId, ID);
          break;
        case "leaveAll":
          // Leave all rooms
          rooms.leaveAllRooms(ID);
          break;
      }
    });

    ws.on("close", () => {
      rooms.leaveAllRooms(ID);
    });
  });
};

export const redisSubscriptionInit = async (redis: redisType) => {
  await redis.subscriber.subscribe("chat", async (data, channel) => {
    const message = JSON.parse(data);

    await rooms.sendMessage(message);

    console.log("Message received from Redis", message);
  });
};
