import { PrismaClient } from "@prisma/client";
import express, { ErrorRequestHandler, RequestHandler } from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { NODE_ENV, PORT } from "./config";
import cors from "cors";
import { router } from "./routes";
import cookieParser from "cookie-parser";

export const prisma = new PrismaClient();

async function main() {
  const app = express();

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

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

async function exit() {
  await prisma.$disconnect();
  console.info("Disconnected from database");
}

main();

process.on("beforeExit", exit);
