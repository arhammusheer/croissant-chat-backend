import { compare, hash } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../app";
import { getRandomColor, getRandomEmoji } from "../utils/avatar";
import { validateEmail, validatePassword } from "../utils/validation";

export const auth = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new Error("400: Email and password are required");
      }

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new Error("401: User not found");
      }

      const isPasswordCorrect = await compare(password, user.password);

      if (!isPasswordCorrect) {
        throw new Error("401: Invalid credentials");
      }

      return res.json({
        status: "success",
        data: {
          user: {
            id: user.id,
            email: user.email,
            emoji: user.emoji,
            background: user.backgroundColor,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      if (!email || !password) {
        throw new Error("400: Email and password are required");
      }

      // Email validation
      const isEmailValid = validateEmail(email);

      if (!isEmailValid) {
        throw new Error("400: Invalid email");
      }

      // Password validation
      const isPasswordValid = validatePassword(password);

      if (!isPasswordValid) {
        throw new Error("400: Invalid password");
      }

      // Check if user already exists
      const exists = await prisma.user.count({
        where: {
          email,
        },
      });

      if (exists > 0) {
        throw new Error("400: User already exists");
      }

      const saltedPassword = await hash(password, 10);

      const randomEmoji = getRandomEmoji();
      const randomColor = getRandomColor();

      const user = await prisma.user.create({
        data: {
          email: email,
          password: saltedPassword,
          emoji: randomEmoji,
          backgroundColor: randomColor,
        },
      });

      return res.json({
        status: "success",
        data: {
          user: {
            id: user.id,
            email: user.email,
            emoji: user.emoji,
            background: user.backgroundColor,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
