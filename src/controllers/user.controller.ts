import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../app";
import { error, sendHttpError } from "../common/error.message";
import { getRandomColor, getRandomEmoji } from "../utils/avatar";

export const user = {
  profile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
      });

      if (!profile) {
        return sendHttpError(res, error.USER_NOT_FOUND)
      }

      return res.json({
        status: "success",
        data: {
          user: {
            id: profile.id,
            email: profile.email,
            emoji: profile.emoji,
            background: profile.backgroundColor,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
  randomizeEmoji: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const randomEmoji = getRandomEmoji();
      const randomColor = getRandomColor();

      const profile = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          emoji: randomEmoji,
          backgroundColor: randomColor,
        },
      });

      return res.json({
        status: "success",
        data: {
          user: {
            id: profile.id,
            email: profile.email,
            emoji: profile.emoji,
            background: profile.backgroundColor,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
  addLocationLog: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { latitude, longitude } = req.body;
      const userId = Prisma.validator<Prisma.UserWhereUniqueInput>()({
        id: req.user.id,
      });

      if (latitude === undefined || longitude === undefined) {
        return sendHttpError(res, error.LAT_LONG_REQUIRED)
      }

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return sendHttpError(res, error.LAT_LONG_MUST_BE_NUMBERS)
      }

      if (latitude < -90 || latitude > 90) {
        return sendHttpError(res, error.LAT_LONG_MUST_BE_BETWEEN_MINUS_90_AND_90)
      }

      if (longitude < -180 || longitude > 180) {
        return sendHttpError(res, error.LAT_LONG_MUST_BE_BETWEEN_MINUS_180_AND_180)
      }

      const locationLog = await prisma.locationLog.create({
        data: {
          latitude,
          longitude,
          User: {
            connect: userId,
          },
        },
      });

      return res.json({
        status: "success",
        data: {
          locationLog: {
            id: locationLog.id,
            latitude: locationLog.latitude,
            longitude: locationLog.longitude,
            createdAt: locationLog.createdAt,
            updatedAt: locationLog.updatedAt,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
  getLocationLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query;

      const locationLogs = await prisma.locationLog.findMany({
        where: {
          userId: req.user.id,
        },
        take: limit ? Number(limit) : 10,
        skip: offset ? Number(offset) : 0,
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.json({
        status: "success",
        data: {
          locationLogs,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
