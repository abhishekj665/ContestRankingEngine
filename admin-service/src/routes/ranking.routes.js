import express from "express";
import * as rankingController from "../controllers/ranking.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/run", auth, rankingController.runRanking);
router.get("/latest", auth, rankingController.getLatestRankingRun);
router.get("/:rankingRunId", auth, rankingController.getRankingRunById);

export const RankingRoutes = router;
