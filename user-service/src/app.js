import express from "express";
import cors from "cors";

// Import routes
import { UserRoutes } from "./routes/user.route.js";
import { PostRoutes } from "./routes/post.route.js";
import { InternalRoutes } from "./routes/internal.route.js";

import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware.js";

import { env } from "./config/env.js";

const app = express();

const allowedOrigins = [env.ADMIN_SERVICE_URL];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-internal-key"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", UserRoutes);
app.use("/api/posts", PostRoutes);
app.use("/internal", InternalRoutes);

app.use(globalErrorHandler);

export default app;
