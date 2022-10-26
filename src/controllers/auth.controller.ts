import { compare, hash } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../app";
import { getRandomColor, getRandomEmoji } from "../utils/avatar";
import { validateEmail, validatePassword } from "../utils/validation";
import jwt from "jsonwebtoken";
import { NODE_ENV } from "../config";

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

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          emoji: user.emoji,
          background: user.backgroundColor,
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
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
          token,
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

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          emoji: user.emoji,
          background: user.backgroundColor,
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
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
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
