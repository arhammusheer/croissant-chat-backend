import { NextFunction, Request, Response } from "express";
import { prisma, redis } from "../app";
import { error, sendHttpError } from "../common/error.message";
import { ChatRoomManager } from "../services/room.service";

const rooms = new ChatRoomManager();

export const chat = {
  getRecentMessages: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { roomId } = req.params;
      const { limit = "20", offset = "0" } = req.query;

      if (!roomId) {
        return sendHttpError(res, error.ROOM_NOT_FOUND);
      }

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
      const { content } = req.body as { content: string };

      if (!roomId) {
        return sendHttpError(res, error.ROOM_NOT_FOUND);
      }

      if (!content) {
        return sendHttpError(res, error.MESSAGE_REQUIRED);
      }

      if (content.length > 1000) {
        return sendHttpError(res, error.MESSAGE_TOO_LONG);
      }

      const message = await prisma.message.create({
        data: {
          text: content,
          User: {
            connect: {
              id: req.user.id,
            },
          },
          room: {
            connect: {
              id: roomId,
            },
          },
        },
      });

      const payload = {
        id: message.id,
        roomId,
        userId: req.user.id,
        text: message.text,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };

      redis.publisher.publish("chat", JSON.stringify(payload));

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
