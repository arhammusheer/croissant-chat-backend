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
};
