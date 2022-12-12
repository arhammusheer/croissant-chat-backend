import { WebSocket } from "ws";
import { UserSocket } from "./user.service";

const users = new UserSocket();

interface ChatRoom {
  roomId: string;
  users: string[];
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
      users: [userId],
    };

    this.rooms.set(roomId, newRoom);

    return newRoom;
  }

  async joinRoom(roomId: string, userId: string, ws: WebSocket) {
    const room = await this.createRoom(roomId, userId);

    // If user is already in room, ignore

    if (room.users.includes(userId)) {
      return room;
    }

    room.users.push(userId);

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

    room.users = room.users.filter((user) => user !== userId);

    if (room.users.length === 0) {
      this.rooms.delete(roomId);
    }
  }

  async sendMessage({
    id,
    roomId,
    userId,
    text,
    createdAt,
    updatedAt,
  }: {
    id: string;
    roomId: string;
    userId: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    const payload = {
      id,
      roomId,
      userId,
      text,
      createdAt,
      updatedAt,
    };

    room.users.forEach((userId) => {
      const user = users.getUser(userId);

      if (!user) {
        return;
      }

      user.send({
        type: "chat",
        data: payload,
      });
    });
  }

  async editMessage({
    id,
    roomId,
    userId,
    text,
    createdAt,
    updatedAt,
  }: {
    id: string;
    roomId: string;
    userId: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    const payload = {
      id,
      roomId,
      userId,
      text,
      createdAt,
      updatedAt,
    };

    room.users.forEach((userId) => {
      const user = users.getUser(userId);

      if (!user) {
        return;
      }

      user.send({
        type: "chat:edit",
        data: payload,
      });
    });
  }

  async deleteMessage({ id, roomId }: { id: string; roomId: string }) {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    const payload = {
      id,
      roomId,
    };

    room.users.forEach((userId) => {
      const user = users.getUser(userId);

      if (!user) {
        return;
      }

      user.send({
        type: "chat:delete",
        data: payload,
      });
    });
  }

  async getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  async getRooms() {
    return this.rooms;
  }

  async disconnectUser(userId: string) {
    this.rooms.forEach((room) => {
      room.users = room.users.filter((user) => user !== userId);
    });
  }
}
