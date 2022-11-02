import { compare, hash } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../app";
import { getRandomColor, getRandomEmoji } from "../utils/avatar";
import { validateEmail, validatePassword } from "../utils/validation";
import jwt from "jsonwebtoken";
import { error, sendHttpError } from "../common/error.message";

export const auth = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendHttpError(res, error.EMAIL_AND_PASSOWORD_REQUIRED)
      }

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        return sendHttpError(res, error.USER_NOT_FOUND)
      }

      const isPasswordCorrect = await compare(password, user.password);

      if (!isPasswordCorrect) {
        return sendHttpError(res, error.INVALID_CREDENTIALS)
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

      res.cookie("token", `Bearer ${token}`, {
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
        return sendHttpError(res, error.EMAIL_AND_PASSOWORD_REQUIRED)
      }

      // Email validation
      const isEmailValid = validateEmail(email);

      if (!isEmailValid) {
        return sendHttpError(res, error.INVALID_EMAIL)
      }

      // Password validation
      const isPasswordValid = validatePassword(password);

      if (!isPasswordValid) {
        return sendHttpError(res, error.INVALID_PASSWORD)
      }

      // Check if user already exists
      //TODO remove this verification and make use of Prisma's conflict exceptions
      const exists = await prisma.user.count({
        where: {
          email,
        },
      });

      if (exists > 0) {
        return sendHttpError(res, error.USER_ALREADY_EXISTS)
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

      res.cookie("token", `Bearer ${token}`, {
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
