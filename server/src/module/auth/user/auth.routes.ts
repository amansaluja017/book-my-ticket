import express from "express";
import * as customerController from "./auth.controller";
import validate from "../../../common/middleware/dto.middleware";
import * as authDto from "../../dto/auth.dto";
import { validateUserMiddleware } from "./auth.middleware";
import { upload } from "../../../common/middleware/multer.middleware";

const router = express.Router();

router.post(
  "/register",
  validate(authDto.RegisterDto),
  customerController.registerCustomer,
);
router.post(
  "/login",
  validate(authDto.LoginDto),
  customerController.loginCustomer,
);
router.post(
  "/o/token",
  customerController.oauthTokenExchange,
);
router.post("/verify/:token", customerController.verifyCustomer);
router.post(
  "/logout",
  validateUserMiddleware,
  customerController.logoutCustomer,
);
router.get("/refresh", customerController.refreshCustomer);
router.post(
  "/forgot-password",
  validate(authDto.ForgotPasswordDto),
  customerController.forgotPassword,
);
router.post(
  "/new-password/:token",
  validate(authDto.NewPasswordDto),
  customerController.newPassword,
);
router.get(
  "/profile",
  validateUserMiddleware,
  customerController.customerProfile,
);
router.put("/profile/avatar", validateUserMiddleware, upload.single("avatar"), customerController.uploadAvatar);
router.get(
  "/tickets/:paymentId",
  validateUserMiddleware,
  customerController.getCustomerTickets,
);
router.get(
  "/bookings",
  validateUserMiddleware,
  customerController.getCustomerBookings,
);

export default router;
