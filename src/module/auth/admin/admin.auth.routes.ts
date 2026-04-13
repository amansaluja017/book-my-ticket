import express from "express";
import * as adminController from "./admin.auth.controller";
import validate from "../../../common/middleware/dto.middleware";
import * as adminDto from "../../dto/admin.auth.dto";
import { validateAdminMiddleware } from "./admin.auth.middleware";

const router = express.Router();

// router.post(
//   "/register",
//   validate(adminDto.RegisterDto),
//   adminController.registerAdmin,
// );
router.post("/login", validate(adminDto.LoginDto), adminController.loginAdmin);
router.get(
  "/logout",
  validateAdminMiddleware,
  adminController.logoutAdmin,
);
router.get("/refresh", adminController.refreshAdmin);
router.get(
  "/profile",
  validateAdminMiddleware,
  adminController.adminProfile,
);

export default router;
