import { WebSocket } from "ws";

interface IUser {
  id: string;
  ws: WebSocket;
  location: {
    lat: number;
    lng: number;
    exists: boolean;
  };
}

interface IUserSocket {
  users: Map<string, User>;
}

export class UserSocket {
  private static instance: UserSocket;
  private users: Map<string, User> = new Map();

  constructor() {
    if (UserSocket.instance) {
      return UserSocket.instance;
    }

    UserSocket.instance = this;

    return this;
  }

  addUser(user: User) {
    this.users.set(user.id, user);
  }

  removeUser(userId: string) {
    this.users.delete(userId);
  }

  getUser(userId: string) {
    return this.users.get(userId);
  }

  getUsers() {
    return this.users;
  }

  getAliveUsers() {
    return Array.from(this.users.values()).filter((user) => user.isAlive);
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2); // Haversine formula
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great-circle distance in radians

    const d = R * c; // in metres
    return d;
  }

  getUsersNearby(
    location: { lat: number; lng: number },
    radius: number
  ): { user: User; distance: number }[] {
    const users = Array.from(this.users.values()).filter(
      (user) => user.isAlive
    );

    return users
      .map((user) => {
        const distance = this.getDistance(
          location.lat,
          location.lng,
          user.location.lat,
          user.location.lng
        );

        return {
          user,
          distance,
        };
      })
      .filter(({ distance }) => distance < radius);
  }

  sendBatch(data: any, users: User[]) {
    users.forEach((user) => user.send(data));
  }
}

export class User implements IUser {
  private user: IUser;

  constructor({ id, ws }: { id: string; ws: WebSocket }) {
    this.user = {
      id,
      ws,
      location: {
        lat: 0,
        lng: 0,
        exists: false,
      },
    };
  }

  get id() {
    return this.user.id;
  }

  get ws() {
    return this.user.ws;
  }

  get location() {
    return this.user.location;
  }

  set location(location: { lat: number; lng: number; exists: boolean }) {
    this.user.location = location;
  }

  get isLocationSet() {
    return this.user.location.exists;
  }

  get isAlive() {
    return this.ws.readyState === WebSocket.OPEN;
  }

  send(data: any) {
    this.ws.send(JSON.stringify(data));
  }

  close() {
    this.ws.close();
  }
}
