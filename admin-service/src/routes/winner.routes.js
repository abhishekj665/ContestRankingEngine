import express from "express";
import * as winnerController from "../controllers/winner.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { winnerQuerySchema, winnerSchema } from "../validations/winner.validator.js";

const router = express.Router();

router.post("/", auth, validate(winnerSchema), winnerController.allocateWinner);
router.get("/", auth, validate(winnerQuerySchema, "query"), winnerController.getWinners);

export const WinnerRoutes = router;
