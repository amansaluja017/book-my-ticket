import express from "express";
import { Express } from "express";
import authRouter from "./auth/auth.routes";
import cookieParser from "cookie-parser";
import { verifyJwt } from "./auth/auth.middleware";

function createExpressServer(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(verifyJwt);

  app.use("/customer", authRouter);

  return app;
}

export default createExpressServer;
