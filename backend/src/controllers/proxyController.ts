import { NextFunction, Request, Response } from "express";
import { catchErrorAsync } from "../libs/errorHandler";
import axios from "axios";
// import logger from "../libs/logger";

export const proxyController = catchErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
   let config = {
      baseURL: req.body.baseURL,
      headers: req.body.headers,
      url: req.body.url,
      method: req.body.method,
      data: req.body.data,
      timeout: req.body.timeout ? req.body.timeout * 1000 : 0, // axios default timeout is 0 (no timeout)
   };
   try {
      const response = await axios(config);
      res.status(response.status).json(response.data);
   } catch (e) {
      if (e.response) res.status(e.response.status).json(e.response.data);
      else res.status(500).json(e.message);
   }
});
