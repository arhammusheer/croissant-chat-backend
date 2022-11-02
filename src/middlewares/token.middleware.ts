import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { error, sendHttpError } from "../common/error.message";

declare module "express-serve-static-core" {
  // eslint-disable-next-line no-unused-vars
  interface Request {
    user: any;
  }
}

export default (req: Request, res: Response, next: NextFunction) => {
  // Get Auth Token
  const bearer = req.cookies["token"] || req.headers["authorization"];

  if (!bearer) {
    return sendHttpError(res, error.NO_TOKEN_PROVIDED)
  }

  // Check if token starts with bearer
  if (!bearer.startsWith("Bearer ")) {
    return sendHttpError(res, error.BEARER_TOKEN_MISSING)
  }

  // Remove Bearer from token
  const [, token] = bearer.split(" ");

  try {
    const decoded = verify(token, process.env.JWT_SECRET as string);

    if (!decoded) {
      return sendHttpError(res, error.INVALID_TOKEN)
    }

    req.user = decoded;
    next();
  } catch (err) {
    return sendHttpError(res, error.INVALID_TOKEN)
  }
};
