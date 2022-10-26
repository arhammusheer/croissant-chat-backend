import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

declare module "express-serve-static-core" {
  // eslint-disable-next-line no-unused-vars
  interface Request {
    user: any;
  }
}

export default (req: Request, res: Response, next: NextFunction) => {
  // Get Auth Token
  const bearer = req.cookies["token"] || req.headers["authorization"];

  console.log("Bearer:", bearer);
  if (!bearer) {
    throw new Error("401: Unauthorized. No token provided.");
  }

  // Check if token starts with bearer
  if (!bearer.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      error: "Unauthorized. Bearer token missing.",
    });
  }

  // Remove Bearer from token
  const [, token] = bearer.split(" ");

  try {
    const decoded = verify(token, process.env.JWT_SECRET as string);

    if (!decoded) {
      throw new Error("401: Unauthorized. Invalid token.");
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: "error",
      error: "Unauthorized. Invalid token.",
    });
  }
};
