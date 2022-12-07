import { NextFunction, Request, Response } from "express";
import { prisma } from "../app";

export const people = {
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const profile = await prisma.user.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          emoji: true,
          backgroundColor: true,
        },
      });

      res.json({
        status: "success",
        data: {
          profile,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
