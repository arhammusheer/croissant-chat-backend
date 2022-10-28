import { NextFunction, Request, Response } from "express";
import { prisma } from "../app";

export const chat = {
  getRecentMessages: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { roomId } = req.params;
      const { limit = "20", offset = "0" } = req.query;

      const messages = await prisma.message.findMany({
        where: {
          roomId: roomId,
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.json({
        status: "success",
        data: {
          messages,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  sendMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId } = req.params;
      const { content } = req.body;

      const message = await prisma.message.create({
        data: {
          text: content,
          room: {
            connect: {
              id: roomId,
            },
          },
          User: {
            connect: req.user.id,
          },
        },
      });

      return res.json({
        status: "success",
        data: {
          message,
        },
      });
			
    } catch (err) {
      next(err);
    }
  },
};
