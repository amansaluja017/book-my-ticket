import express from "express";
import { Express } from "express";
import authRouter from "./auth/user/auth.routes";
import adminRouter from "./auth/admin/admin.auth.routes";
import cookieParser from "cookie-parser";
import { verifyJwt } from "./auth/user/auth.middleware";
import { adminVerifyJwt, validateAdminMiddleware } from "./auth/admin/admin.auth.middleware";
import screenRoutes from "./screen/screen.routes";
import showRoutes from "./show/show.routes";
import seatRoutes from "./seat/seat.routes";

function createExpressServer(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use("/customer", verifyJwt, authRouter);
  app.use("/admin", adminVerifyJwt, adminRouter);
  app.use("/screen", adminVerifyJwt, validateAdminMiddleware, screenRoutes);
  app.use("/", showRoutes);
  app.use("/", seatRoutes);

  return app;
}

export default createExpressServer;
