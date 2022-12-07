import { WebSocket } from "ws";

interface ChatRoom {
  roomId: string;
  users: Map<string, WebSocket>; // userId, WebSocket
}

export class ChatRoomManager {
  private rooms: Map<string, ChatRoom> = new Map();
  private static instance: ChatRoomManager;

  constructor() {
    if (ChatRoomManager.instance) {
      return ChatRoomManager.instance;
    }

    ChatRoomManager.instance = this;

    return this;
  }

  async createRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);

    if (room) {
      return room;
    }

    const newRoom = {
      roomId,
      users: new Map<string, WebSocket>(),
    };

    this.rooms.set(roomId, newRoom);

    return newRoom;
  }

  async joinRoom(roomId: string, userId: string, ws: WebSocket) {
    const room = await this.createRoom(roomId, userId);

    // If user is already in room, ignore

    if (room.users.has(userId)) {
      ws.send(
        JSON.stringify({
          status: "warning",
          message: "Already in room",
        })
      );
      return room;
    }

    room.users.set(userId, ws);

    ws.send(
      JSON.stringify({
        status: "success",
        message: "Joined room",
      })
    );
    return room;
  }

  async leaveRoom(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    room.users.delete(userId);

    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  async sendMessage(roomId: string, userId: string, message: string) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    const payload = {
      roomId,
      userId,
      message,
    };

    room.users.forEach((ws) => {
      ws.send(JSON.stringify(payload));
    });
  }

  async leaveAllRooms(userId: string) {
    this.rooms.forEach((room) => {
      room.users.delete(userId);
    });
  }
}
