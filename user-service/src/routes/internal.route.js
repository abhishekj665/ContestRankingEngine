import express from "express";
import * as internalController from "../controllers/internal.controller.js";
import { internalAuth } from "../middlewares/internalAuth.middleware.js";

const router = express.Router();

router.get("/scored-posts", internalAuth, internalController.getScoredPosts);
router.get("/eligible-users", internalAuth, internalController.getEligibleUsers);
router.get(
  "/weekly-top-three",
  internalAuth,
  internalController.getWeeklyTopThree,
);

export const InternalRoutes = router;
