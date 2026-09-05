import express from "express";
import cors from "cors";

// Import routes
import { UserRoutes } from "./routes/user.route.js";
import { PostRoutes } from "./routes/post.route.js";

import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", UserRoutes);
app.use("/api/posts", PostRoutes);


app.use(globalErrorHandler);

export default app;

