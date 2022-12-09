import { NextFunction, Request, Response } from "express";
import geoIP from "../utils/geoip";

export const utils = {
  geoip(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.headers["x-forwarded-for"] || req.query.ip;

      if (!ip) {
        throw new Error("No IP provided");
      }

      const geo = geoIP.getCoords(ip as string);

      res.json({
        status: "success",
        data: {
          ip,
          geo,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
