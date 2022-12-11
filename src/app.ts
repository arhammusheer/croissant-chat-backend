import { PrismaClient } from "@prisma/client";
import express, { ErrorRequestHandler, RequestHandler } from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { NODE_ENV, PORT } from "./config";
import cors from "cors";
import { router } from "./routes";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { initializeWebSockets } from "./websockets/chat.sockets";
import { verify } from "jsonwebtoken";
import { createClient } from "redis";

export const prisma = new PrismaClient();
const publisher = createClient({
  url: process.env.REDIS_URL,
});
const subscriber = publisher.duplicate();

export const redis = {
  publisher,
  subscriber,
};

const app = express();
export const server = createServer(app);
export const wss = new WebSocketServer({
  server: server,
  path: "/ws",
  clientTracking: true,
  // verifyClient: (info, done) => {
  //   const { authorization } = info.req.headers;

  //   if (!authorization) {
  //     return done(false, 401, "Unauthorized");
  //   }

  //   const [scheme, token] = authorization.split(" ");

  //   if (scheme !== "Bearer") {
  //     return done(false, 401, "Unauthorized");
  //   }

  //   if (!token) {
  //     return done(false, 401, "Unauthorized");
  //   }

  //   // Verify token
  //   const decoded = verify(token, process.env.JWT_SECRET as string);

  //   if (!decoded) {
  //     return done(false, 401, "Unauthorized");
  //   }

  //   return done(true);
  // },
});

async function main() {
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: [
        `http://localhost:${PORT}`,
        `http://localhost:3000`,
        "https://chat.croissant.one",
        /croissant\.one$/, // Allow subdomains from croissant.one (e.g. chat.croissant.one)
      ],
      credentials: true,
    })
  );

  app.use("/", router);
  initializeWebSockets(wss);

  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const [status, message] = err.message.includes(":")
      ? err.message.split(":").map((s: string) => s.trim())
      : [500, "Internal Server Error"];

    res.status(Number(status) || 500).json({
      status: "error",
      message,
      stack: NODE_ENV === "production" ? undefined : err.stack,
    });
  };

  const _404: RequestHandler = (req, res, next) => {
    res.status(404).json({
      status: "error",
      message: "Not Found",
    });
  };

  app.use(errorHandler);
  app.use(_404);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

async function exit() {
  await prisma.$disconnect();
  console.info("Disconnected from database");
}

main();

process.on("beforeExit", exit);
