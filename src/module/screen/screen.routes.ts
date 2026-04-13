import express from "express";
import * as screenController from "./screen.controller";
import validate from "../../common/middleware/dto.middleware";
import * as screenDto from "../dto/screen.dto";

const router = express.Router();

router.post(
  "/register",
  validate(screenDto.RegisterDto),
  screenController.registerScreen,
);

export default router;
