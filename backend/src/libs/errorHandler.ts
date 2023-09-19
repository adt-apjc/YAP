import { NextFunction, Request, Response } from "express";
import logger from "./logger";

export class AppError extends Error {
   statusCode: number;

   constructor(message: string, status = 500, name = "AppError") {
      super(message);
      this.name = name;
      this.statusCode = status;
   }
}

export const catchErrorAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
   return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
   };
};
