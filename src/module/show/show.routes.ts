import express from "express";
import * as showController from "./show.controller";
import validate from "../../common/middleware/dto.middleware";
import * as showDto from "../dto/show.dto";
import {
  adminVerifyJwt,
  validateAdminMiddleware,
} from "../auth/admin/admin.auth.middleware";

const router = express.Router();

router.post(
  "/show/register",
  adminVerifyJwt,
  validateAdminMiddleware,
  validate(showDto.RegisterDto),
  showController.createShow,
);

router.get("/", showController.getShows);

export default router;
