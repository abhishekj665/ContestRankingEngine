import express from "express";
import * as adminAuthController from "../controllers/admin-auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { adminLoginSchema } from "../validations/admin-auth.validator.js";

const router = express.Router();

router.post("/login", validate(adminLoginSchema), adminAuthController.loginAdmin);

export const AdminAuthRoutes = router;
