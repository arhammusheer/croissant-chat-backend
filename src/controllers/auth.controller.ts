import { compare, hash } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../app";
import { getRandomColor, getRandomEmoji } from "../utils/avatar";
import { validateEmail, validatePassword } from "../utils/validation";
import jwt from "jsonwebtoken";
import { error, sendHttpError } from "../common/error.message";
import { EmailService } from "../services/email.service";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID } from "../config";

const googleAuthClient = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
});

export const auth = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendHttpError(res, error.EMAIL_AND_PASSOWORD_REQUIRED);
      }

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        return sendHttpError(res, error.USER_NOT_FOUND);
      }

      const isPasswordCorrect = await compare(password, user.password);

      if (!isPasswordCorrect) {
        return sendHttpError(res, error.INVALID_CREDENTIALS);
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
        return sendHttpError(res, error.EMAIL_AND_PASSOWORD_REQUIRED);
      }

      // Email validation
      const isEmailValid = validateEmail(email);

      if (!isEmailValid) {
        return sendHttpError(res, error.INVALID_EMAIL);
      }

      // Password validation
      const isPasswordValid = validatePassword(password);

      if (!isPasswordValid) {
        return sendHttpError(res, error.INVALID_PASSWORD);
      }

      // Check if user already exists
      //TODO remove this verification and make use of Prisma's conflict exceptions
      const exists = await prisma.user.count({
        where: {
          email,
        },
      });

      if (exists > 0) {
        return sendHttpError(res, error.USER_ALREADY_EXISTS);
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

  // Generate a code and send it to the user's email
  passwordless: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      let usercreated = false;

      if (!email) {
        return sendHttpError(res, error.INVALID_EMAIL);
      }

      let user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      // If the user doesn't exist, create it
      if (!user) {
        const randomEmoji = getRandomEmoji();
        const randomColor = getRandomColor();

        user = await prisma.user.create({
          data: {
            email,
            password: Math.random().toString(36).slice(-8), // Generate a random password for security reasons
            emoji: randomEmoji,
            backgroundColor: randomColor,
          },
        });

        usercreated = true;
      }

      // Check if the user recently requested a code
      const lastCode = await prisma.oneTimeCode.findFirst({
        where: {
          userId: user.id,
          // Isn't expired
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (lastCode) {
        return sendHttpError(res, error.TOO_MANY_REQUESTS);
      }

      // Alpha-numeric code of 12 characters plus uniuq

      const code = `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .substring(2, 12)}`;

      const link = `https://chat.croissant.one/passwordless?code=${code}`;

      // Send email
      await EmailService.sendPasswordlessEmail(email, link);

      const linkExpiration = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      // Save code in the database
      await prisma.oneTimeCode.create({
        data: {
          code,
          userId: user.id,
          expiresAt: linkExpiration,
        },
      });

      return res.json({
        status: "success",
        data: {
          new: usercreated,
          message: "Email sent",
          expiresAt: linkExpiration,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Verify the token and log the user in
  passwordlessCallback: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { code } = req.query as { code: string };

      if (!code) {
        return sendHttpError(res, error.INVALID_CODE);
      }

      const oneTimeCode = await prisma.oneTimeCode.findFirst({
        where: {
          code,
          used: false,
        },
      });

      if (!oneTimeCode) {
        return sendHttpError(res, error.INVALID_CODE);
      }

      if (oneTimeCode.expiresAt < new Date()) {
        return sendHttpError(res, error.INVALID_CODE);
      }

      const user = await prisma.user.findUnique({
        where: {
          id: oneTimeCode.userId as string,
        },
      });

      if (!user) {
        return sendHttpError(res, error.USER_NOT_FOUND);
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

      // Mark the code as used
      await prisma.oneTimeCode.update({
        where: {
          id: oneTimeCode.id,
        },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

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

  google: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query as { token: string };

      if (!token) {
        return sendHttpError(res, error.INVALID_CODE);
      }

      const ticket = await googleAuthClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return sendHttpError(res, error.INVALID_CODE);
      }

      let user = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user) {
        const randomEmoji = getRandomEmoji();
        const randomColor = getRandomColor();

        user = await prisma.user.create({
          data: {
            email: payload.email || "",
            password: Math.random().toString(36).slice(-8), // Generate a random password for security reasons
            emoji: randomEmoji,
            backgroundColor: randomColor,
          },
        });
      }

      const jwtToken = jwt.sign(
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

      res.cookie("token", `Bearer ${jwtToken}`, {
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
          token: jwtToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      return res.json({
        status: "success",
        data: {},
      });
    } catch (err) {
      next(err);
    }
  },
};
