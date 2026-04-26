import crypto from "crypto";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { Response } from "express";
import ApiError from "./api-error";

interface Payload {
  id: string;
  email: string;
  role: "customer" | "seller" | "admin";
}

export function generateAccessToken(payload: Payload): string {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESSTOKEN_SECRET! as jwt.Secret,
    {
      expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRES! || "15m",
    } as jwt.SignOptions,
  );
}

export function generateRefreshToken(payload: { id: string }): string {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESHTOKEN_SECRET! as jwt.Secret,
    {
      expiresIn: process.env.JWT_REFRESHTOKEN_EXPIRES || "1d",
    } as jwt.SignOptions,
  );
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESSTOKEN_SECRET!);
  } catch (err: unknown) {
    if (err instanceof JsonWebTokenError) {
      if ((err.name === "TokenExpiredError")) {
        throw ApiError.unauthorized("token is expired");
      } else {
        throw ApiError.badRequest("invalid token");
      }
    }
  }
}

export function verifyRefreshToken(res: Response, token: string) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESHTOKEN_SECRET!);
  } catch (err: unknown) {
    if (err instanceof JsonWebTokenError) {
      if ((err.name === "TokenExpiredError")) {
        res.clearCookie("refreshToken");
        throw ApiError.badRequest("token is expired");
      } else {
        throw ApiError.badRequest("invalid token");
      }
    }
  }
}

export function generateResetToken(): {
  rawToken: string;
  hashedToken: string;
} {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
}
