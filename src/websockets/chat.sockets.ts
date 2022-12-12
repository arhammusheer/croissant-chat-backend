import { WebSocketServer } from "ws";
import { redisType } from "../app";
import { ChatRoomManager } from "../services/room.service";
import { User, UserSocket } from "../services/user.service";

const rooms = new ChatRoomManager();
const users = new UserSocket();

interface WSMessage {
  type: "join" | "leave";
  roomId: string;
}

interface WSMessageLeaveAll {
  type: "leaveAll";
}

interface WSMessageLocationUpdate {
  type: "location";
  location: {
    latitude: number;
    longitude: number;
  };
}

type WSMessageTypes = WSMessage | WSMessageLeaveAll | WSMessageLocationUpdate;

export const initializeWebSockets = (wss: WebSocketServer) => {
  wss.on("connection", (ws) => {
    const ID =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const user = new User({
      id: ID,
      ws,
    });

    users.addUser(user);

    ws.on("message", (data) => {
      const message: WSMessageTypes = JSON.parse(data.toString());

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
          rooms.disconnectUser(ID);
          break;
        case "location":
          // Update location
          if (!user.location) {
            break;
          }

          user.location = {
            lat: message.location.latitude,
            lng: message.location.longitude,
            exists: true,
          };
          console.log("Updating location", user.location);
          break;
      }
    });

    ws.on("close", () => {
      rooms.disconnectUser(ID);
    });
  });
};

export const redisSubscriptionInit = async (redis: redisType) => {


  await redis.subscriber.subscribe("chat", async (data, channel) => {
    const message = JSON.parse(data);
    await rooms.sendMessage(message);
  });

  await redis.subscriber.subscribe("chat:delete", async (data, channel) => {
    const message = JSON.parse(data);
    await rooms.deleteMessage(message);
  });

  await redis.subscriber.subscribe("chat:edit", async (data, channel) => {
    const message = JSON.parse(data);
    await rooms.editMessage(message);
  });
    

  await redis.subscriber.subscribe("room", async (data, channel) => {
    const message = JSON.parse(data);

    const nearbyUsers = users.getUsersNearby(
      {
        lat: message.data.latitude,
        lng: message.data.longitude,
      },
      5
    );

    nearbyUsers.forEach(({ user, distance }) => {
      const msg = {
        type: "room",
        data: {
          id: message.data.id,
          name: message.data.name,
          createdAt: message.data.createdAt,
          updatedAt: message.data.updatedAt,
          distance,
        },
      };

      user.send(msg);
    });
  });
};
