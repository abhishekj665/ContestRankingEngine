import express from "express";
import cors from "cors";

import { RankingRoutes } from "./routes/ranking.routes.js";
import { WinnerRoutes } from "./routes/winner.routes.js";
import { KycRoutes } from "./routes/kyc.routes.js";
import { AdminAuthRoutes } from "./routes/admin-auth.routes.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/admin/auth", AdminAuthRoutes);
app.use("/api/rankings", RankingRoutes);
app.use("/api/winners", WinnerRoutes);
app.use("/api/winners", KycRoutes);

app.use(globalErrorHandler);

export default app;
