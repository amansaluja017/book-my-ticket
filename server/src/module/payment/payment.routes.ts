import express from "express";
import * as paymentController from "./payment.controller";
import validate from "../../common/middleware/dto.middleware";
import * as paymentDto from "../dto/payment.dto";
import { validateUserMiddleware } from "../auth/user/auth.middleware";

const router = express.Router();

router.post(
  "/create",
  validate(paymentDto.CreatePaymentDto),
  validateUserMiddleware,
  paymentController.createPayment,
);

router.post(
  "/verify",
  validate(paymentDto.VerifyPaymentDto),
  validateUserMiddleware,
  paymentController.verifyPayment,
);

export default router;
