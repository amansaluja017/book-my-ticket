import { Response, Request } from "express";
import ApiResponse from "../../../common/utils/api-response";
import ApiError from "../../../common/utils/api-error";
import {
  loginCustomerService,
  registerCustomerService,
  verifyCustomerService,
  logoutCustomerService,
  refreshCustomerService,
  forgotPasswordService,
  newPasswordService,
  customerProfileService,
  getCustomerTicketsService,
} from "./auth.service";

export const registerCustomer = async (req: Request, res: Response) => {
  const user = await registerCustomerService(req.body);

  if (!user)
    ApiError.internalError("Internal Error: Failed to register customer");

  ApiResponse.createdUser(res, "user register successfully", user.id);
};

export const verifyCustomer = async (
  req: Request<{ token: string }>,
  res: Response,
) => {
  await verifyCustomerService(req.params);

  ApiResponse.ok(res, "user verified successfully");
};

export const loginCustomer = async (req: Request, res: Response) => {
  if (req.cookies?.refreshToken)
    throw ApiError.badRequest("You are already logged in");

  const { user, accessToken, refreshToken } = await loginCustomerService(
    req.body,
  );

  if (!user) ApiError.internalError("Internal Error: Failed to login customer");
  res.cookie("refreshToken", refreshToken);

  ApiResponse.ok(res, "user login successfully", {
    user,
    accessToken,
  });
};

export const logoutCustomer = async (req: Request, res: Response) => {
  await logoutCustomerService(req.customer, req.cookies?.refreshToken as string);

  res.clearCookie("refreshToken");
  ApiResponse.ok(res, "user logout successfully!");
};

export const refreshCustomer = async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await refreshCustomerService(
    req.cookies as { refreshToken: string },
  );

  res.cookie("refreshToken", refreshToken);
  ApiResponse.ok(res, "Token generated successfully", {
    accessToken,
  });
};

export const customerProfile = async (req: Request, res: Response) => {
  if (!req.customer)
    throw ApiError.unauthorized("You are not authorized, login first!");

  const user = await customerProfileService(req.customer);

  ApiResponse.ok(res, "user fetch successfully", user);
};

export const forgotPassword = async (req: Request, res: Response) => {
  await forgotPasswordService(req.body);

  ApiResponse.ok(res, "Token is send to user's email successfully");
};

export const newPassword = async (
  req: Request<{ token: string }>,
  res: Response,
) => {
  await newPasswordService(req.body, req.params.token);

  ApiResponse.ok(res, "Password reset successfully");
};

export const getCustomerTickets = async (req: Request, res: Response) => {
  const tickets = await getCustomerTicketsService(req.customer);
  
  ApiResponse.ok(res, "user tickets fetch successfully", tickets)
}