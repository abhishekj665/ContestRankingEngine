import app from "./app.js";
import http from "http";

import { connectDb } from "./config/db.js";

import { env } from "./config/env.js";

const server = http.createServer(app);

const PORT = env.PORT;

const startServer = async () => {
  await connectDb();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();