import express from "express";
import * as rankingController from "../controllers/ranking.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validations/winner.validator.js";

const router = express.Router();

router.post("/run", auth, rankingController.runRanking);
router.get("/latest", auth, rankingController.getLatestRankingRun);
router.get("/:rankingRunId", auth, validate(idParamSchema, "params"), rankingController.getRankingRunById);

export const RankingRoutes = router;
