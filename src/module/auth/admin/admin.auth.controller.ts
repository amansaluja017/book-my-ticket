import { Response, Request } from "express";
import ApiResponse from "../../../common/utils/api-response";
import ApiError from "../../../common/utils/api-error";
import {
  loginAdminService,
  registerAdminService,
  logoutAdminService,
  refreshAdminService,
  adminProfileService,
} from "./admin.auth.service";

export const registerAdmin = async (req: Request, res: Response) => {
  const user = await registerAdminService(req.body);

  if (!user)
    ApiError.internalError("Internal Error: Failed to register customer");

  ApiResponse.createdUser(res, "user register successfully", user.id);
};

export const loginAdmin = async (req: Request, res: Response) => {
  if (req.cookies?.refreshToken)
    throw ApiError.badRequest("You are already logged in");

  const { user, accessToken, refreshToken } = await loginAdminService(
    req.body,
  );

  if (!user) ApiError.internalError("Internal Error: Failed to login customer");
  res.cookie("refreshToken", refreshToken);

  ApiResponse.ok(res, "user login successfully", {
    user,
    accessToken,
  });
};

export const logoutAdmin = async (req: Request, res: Response) => {
  await logoutAdminService(req.admin, req.cookies?.refreshToken as string);

  res.clearCookie("refreshToken");
  ApiResponse.ok(res, "user logout successfully!");
};

export const refreshAdmin = async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await refreshAdminService(
    req.cookies as { refreshToken: string },
  );

  res.cookie("refreshToken", refreshToken);
  ApiResponse.ok(res, "Token generated successfully", {
    accessToken,
  });
};

export const adminProfile = async (req: Request, res: Response) => {
  if (!req.admin)
    throw ApiError.unauthorized("You are not authorized, login first!");

  const user = await adminProfileService(req.admin);

  ApiResponse.ok(res, "user fetch successfully", user);
};
