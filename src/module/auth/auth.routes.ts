import express from "express";
import * as customerController from "./auth.controller";
import validate from "../../common/middleware/dto.middleware";
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  NewPasswordDto,
} from "../dto/auth.dto";
import { validateUserMiddleware } from "./auth.middleware";

const router = express.Router();

router.post(
  "/register",
  validate(RegisterDto),
  customerController.registerCustomer,
);
router.post("/login", validate(LoginDto), customerController.loginCustomer);
router.post("/verify/:token", customerController.verifyCustomer);
router.get(
  "/logout",
  validateUserMiddleware,
  customerController.logoutCustomer,
);
router.get(
  "/refresh",
  customerController.refreshCustomer,
);
router.post(
  "/forgot-password",
  validate(ForgotPasswordDto),
  customerController.forgotPassword,
);
router.post(
  "/new-password/:token",
  validate(NewPasswordDto),
  customerController.newPassword,
);
router.get(
  "/profile",
  validateUserMiddleware,
  customerController.customerProfile,
);

export default router;
