import { Prisma, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../app";
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
        return res.status(404).json({
          message: "User not found",
        });
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
