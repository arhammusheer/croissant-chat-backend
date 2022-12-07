import { WebSocketServer } from "ws";
import { createClient } from "redis";
import { prisma } from "../app";
import { ChatRoomManager } from "../services/room.service";

const rooms = new ChatRoomManager();

interface WSMessage {
  type: "join" | "leave";
  roomId: string;
  userId: string;
  message?: string;
}

interface WSMessageLeaveAll {
  type: "leaveAll";
  userId: string;
}

export const initializeWebSockets = (wss: WebSocketServer) => {
  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      const message: WSMessage | WSMessageLeaveAll = JSON.parse(
        data.toString()
      );

      switch (message.type) {
        case "join":
          // Join room
          rooms.joinRoom(message.roomId, message.userId, ws);

          break;
        case "leave":
          // Leave room
          rooms.leaveRoom(message.roomId, message.userId);
          break;
      }
    });
  });
};
