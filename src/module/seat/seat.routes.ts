import express from "express";
import * as seatController from "./seat.controller";
import { validateUserMiddleware, verifyJwt } from "../auth/user/auth.middleware";

const router = express.Router();

router.get(
  "/seats/:showId/:screenId",
  seatController.getSeats,
);

router.put("/", verifyJwt, validateUserMiddleware, seatController.bookSeats);

export default router;
