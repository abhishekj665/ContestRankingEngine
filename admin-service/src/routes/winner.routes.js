import express from "express";
import * as winnerController from "../controllers/winner.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", auth, winnerController.allocateWinner);
router.get("/", auth, winnerController.getWinners);

export const WinnerRoutes = router;
