import express from "express";
import { userSchema } from "../validations/userSchema.validator.js";
import * as userController from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authSchema } from "../validations/authSchema.validator.js";
import { auth } from "../middlewares/auth.middleware.js";
import { residency } from "../validations/residency.validator.js";
const router = express.Router();

router.post("/register", validate(userSchema), userController.registerUser);
router.post("/login", validate(authSchema), userController.loginUser);
router.patch(
  "/update/residency",
  auth,
  validate(residency),
  userController.updateResidency,
);
router.post("/logout", auth, userController.logoutUser);

export const UserRoutes = router;
