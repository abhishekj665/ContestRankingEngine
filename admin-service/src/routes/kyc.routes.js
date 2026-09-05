import express from "express";
import * as kycController from "../controllers/kyc.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:id/kyc/pass", auth, kycController.markPassed);
router.post("/:id/kyc/fail", auth, kycController.markFailed);

export const KycRoutes = router;
