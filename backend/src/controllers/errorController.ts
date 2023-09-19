import { NextFunction, Request, Response } from "express";
import logger from "../libs/logger";

export const errorController = (err: any, req: Request, res: Response, next: NextFunction) => {
   // handle mongo error
   if (process.env.MODE === "dev") {
      logger.error(err.stack);
   } else {
      logger.error(err.message);
   }

   if (err.name && err.name === "CastError") {
      // cast error
      res.status(400).json({ message: `${err.reason ? err.reason.message : err.message}` });
   } else if (err.name && err.name === "ValidationError") {
      res.status(400).json({ message: err.message });
   } else if (err.name && err.name === "CONP login error") {
      res.status(400).json({ message: err.message });
   } else if (err.response) {
      res.status(err.response.status).json({ message: err.response.data.message });
   } else if (err.name && err.name === "CircuitMapperImportError") {
      res.status(err.statusCode).json({ message: err.message, reason: err.reason });
   } else {
      // other error
      err.statusCode = err.statusCode || 500;
      res.status(err.statusCode).json({ message: err.message });
   }
};
