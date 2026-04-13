import { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../common/utils/api-error";
import { verifyAccessToken } from "../../../common/utils/jwt.utils";
import { db } from "../../../db";
import { usersTable } from "../../../db/schema";
import { adminTypes } from "./admin.auth.service";

type decodedTypes = JwtPayload & adminTypes;

export const adminVerifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // res.clearCookie("accessToken").clearCookie("refreshToken")
  // console.log(req.cookies);
  if (!req.headers["authorization"]) return next();

  if (!req.headers["authorization"]?.startsWith("Bearer"))
    throw ApiError.unauthorized("You are not authorized!");

  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) throw ApiError.unauthorized("You are not authorized!");

  const decoded = verifyAccessToken(token) as decodedTypes;
  if (!decoded.role || decoded.role !== "admin")
    throw ApiError.unauthorized("You are not authorized to do this action");

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, decoded.id));

  if (!user) throw ApiError.unauthorized("You are not authorized!");

  if (
    user.logoutAt &&
    decoded.iat &&
    decoded.iat * 1000 < user.logoutAt.getTime()
  )
    throw ApiError.badRequest("Token is expired");

  req.admin = decoded;
  next();
};

export const validateAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.admin)
    throw ApiError.unauthorized("You are not login, Please login first!");
  next();
};
