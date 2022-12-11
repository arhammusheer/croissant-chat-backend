import { NextFunction, Request, Response } from "express";
import { prisma, redis } from "../app";
import { error, sendHttpError } from "../common/error.message";

export const room = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, latitude, longitude } = req.body;

      if (!name) {
        return sendHttpError(res, error.ROOM_NAME_REQUIRED);
      }

      if (latitude === undefined || longitude === undefined) {
        return sendHttpError(res, error.LAT_LONG_REQUIRED);
      }

      const room = await prisma.room.create({
        data: {
          name,
          latitude,
          longitude,
          Owner: {
            connect: {
              id: req.user.id,
            },
          },
        },
      });

      redis.publisher.publish(
        "room",
        JSON.stringify({
          type: "room",
          data: {
            id: room.id,
            name: room.name,
            latitude: room.latitude,
            longitude: room.longitude,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
          },
        })
      );

      return res.json({
        status: "success",
        data: {
          room: {
            id: room.id,
            name: room.name,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getRooms: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { latitude, longitude, radius = "5" } = req.query;

      if (latitude === undefined || longitude === undefined) {
        return sendHttpError(res, error.LAT_LONG_REQUIRED);
      }
      // Find room IDs that are within the radius
      // latitude and longitude are in degrees
      // radius is in kilometers
      const minLat = Number(latitude) - Number(radius) / 111.12;
      const maxLat = Number(latitude) + Number(radius) / 111.12;
      const minLng = Number(longitude) - Number(radius) / 111.12;
      const maxLng = Number(longitude) + Number(radius) / 111.12;

      const rooms = await prisma.room.findMany({
        where: {
          latitude: {
            gte: minLat,
            lte: maxLat,
          },
          longitude: {
            gte: minLng,
            lte: maxLng,
          },
        },
      });

      const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
      ) => {
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
      };

      return res.json({
        status: "success",
        data: {
          rooms: rooms.map((room) => ({
            id: room.id,
            name: room.name,
            distance: calculateDistance(
              Number(latitude),
              Number(longitude),
              room.latitude,
              room.longitude
            ),
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
