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
import { Server } from "socket.io";
import { Client as SSHClient, ConnectConfig } from "ssh2";

// Helper Lib
import { errorController } from "./controllers/errorController";
import { proxyController } from "./controllers/proxyController";
import { pdfGenController } from "./controllers/pdfGenController";
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
   }),
);

app.route("/api/proxy/request").post(proxyController);
app.route("/api/generate/pdf").post(pdfGenController);
// default 404 invalid route
app.route("*").all((req, res) => {
   res.status(404).json({ message: "invalid endpoint." });
});
// Global Error Handling
app.use(errorController);

// SERVER
let httpServer = http.createServer(app); //nginx take care of ssl terminaion so, backend run at http only

// START SERVER !!
let port = process.env.SERVER_PORT || 5001;
httpServer.listen(port, () => {
   logger.info(`Server is running at http://localhost:${port}`);
});

let io = new Server(httpServer, {
   cors: {
      origin: "*",
      methods: ["GET", "POST"],
   },
});

io.on("connection", (socket) => {
   console.log(`user ${socket.id} connected`);

   let connectionConfig: ConnectConfig = {
      host: socket.handshake.query["hostname"] as string,
      username: socket.handshake.query["username"] as string,
      port: socket.handshake.query["port"] ? parseInt(socket.handshake.query["port"] as string) : 22,
      algorithms: { kex: { append: ["diffie-hellman-group14-sha1"], prepend: [], remove: [] } },
      [socket.handshake.query["sshkey"] ? "privateKey" : "password"]: socket.handshake.query["sshkey"]
         ? socket.handshake.query["sshkey"]
         : socket.handshake.query["password"],
   };

   var conn = new SSHClient();
   conn
      .on("ready", function () {
         socket.emit("sshconnect", "\r*** SSH CONNECTION ESTABLISHED ***\r");
         conn.shell(function (err, stream) {
            if (err) return socket.emit("data", "\r\n*** SSH SHELL ERROR: " + err.message + " ***\r\n");
            socket.on("data", function (data) {
               console.log("writing data ", data);
               stream.write(data);
            });
            socket.on("sshdisconnect", function () {
               console.log("logout by button");
               conn.end();
            });
            stream
               .on("data", function (d: BinaryData) {
                  socket.emit("data", d.toString());
                  console.log(d.toString());
               })
               .on("close", function () {
                  console.log("logout by console");
                  conn.end();
                  socket.emit("sshdisconnect", "disconnected");
                  socket.disconnect(true);
               });
         });
      })
      .on("close", function () {
         socket.emit("sshclose", "\r\n*** SSH CONNECTION CLOSED ***\r\n");
      })
      .on("error", function (err) {
         socket.emit("ssherror", "\r\n*** SSH CONNECTION ERROR: " + err.message + " ***\r\n");
      })
      .connect(connectionConfig);

   socket.on("disconnect", () => {
      conn.end();
      console.log(`user ${socket.id} disconnected`);
   });
});
