// Load ENV
if (process.argv.slice(2)[0] === "dev") {
   require("dotenv").config({ path: "./.env.dev" });
} else {
   require("dotenv").config();
}
// External Lib
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

// Helper Lib
import { errorController } from "./controllers/errorController";
import { proxyController } from "./controllers/proxyController";
import logger from "./libs/logger";

const MODE = {
   dev: "dev",
   prod: "production",
};

//
const CORS_OPTION = {
   credentials: true,
   origin: "*",
   optionsSuccessStatus: 200,
};

//
const app = express();
// DEFINE MIDDLEWARES
app.use(cookieParser());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use(express.text());
app.use(cors(CORS_OPTION));

app.use(
   morgan(function (tokens, req, res) {
      return [
         `[info][${new Date().toISOString()}]`,
         `- ${tokens.method(req, res)} -`,
         tokens.url(req, res),
         tokens.status(req, res),
         tokens.res(req, res, "content-length"),
         "-",
         tokens["response-time"](req, res),
         "ms",
      ].join(" ");
   })
);

app.route("/proxy/request").post(proxyController);

// default 404 invalid route
app.route("*").all((req, res) => {
   res.status(404).json({ message: "invalid endpoint." });
});
// Global Error Handling
app.use(errorController);

// SERVER
let Server = http.createServer(app); //nginx take care of ssl terminaion so, backend run at http only

// START SERVER !!
let port = process.env.SERVER_PORT || 5001;
Server.listen(port, () => {
   logger.info(`Server is running at http://localhost:${port}`);
});
