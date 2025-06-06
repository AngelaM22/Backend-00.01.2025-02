import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path, { dirname } from "node:path";
import { Server as SocketServer } from "socket.io";
import { sequelize } from "../config/db/index.js";

import userRoutes from "../modules/users/routes.js";
import authRoutes from "../modules/auth/routes.js";

class Server {
  constructor() {
    this.__dirname = dirname(fileURLToPath(import.meta.url));

    this.port = process.env.PORT || 3000;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketServer(this.server);

    this.middlewares();
    this.routes();
    this.connectDB();
    this.socket();
  }

  middlewares() {

    this.app.use(express.json());

    this.app.use(express.static(path.join(this.__dirname, "../public")));
  }

  connectDB = async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync({

      });
      console.log("Connection has been established successfully.");
    } catch (err) {
      console.log("Error al conectar con la base de datos:", err);
    }
  };

  routes() {

    this.app.use("/users", userRoutes);


    this.app.use("/auth", authRoutes);
  }

  socket() {
    this.io.on("connection", (socket) => {
      console.log("a user connected");

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });

      socket.on("chat event", (data) => {
        console.log(data);

        this.io.emit("respuesta", data);
      });
    });
  }

  listen() {
    this.server.listen(this.port, () => {
      console.log(`Listening on port ${this.port} 🚀`);
    });
  }
}

export default Server;
