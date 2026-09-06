import express from "express";
import * as kycController from "../controllers/kyc.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { idParamSchema } from "../validations/winner.validator.js";

const router = express.Router();

router.post("/:id/kyc/pass", auth, validate(idParamSchema, "params"), kycController.markPassed);
router.post("/:id/kyc/fail", auth, validate(idParamSchema, "params"), kycController.markFailed);

export const KycRoutes = router;
