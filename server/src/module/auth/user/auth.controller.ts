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
  uploadAvatarService,
  getCustomerBookingsService,
  oauthTokenExchangeService,
} from "./auth.service";
import jwt, { JwtPayload } from "jsonwebtoken"
import axios from "axios";

type JwtPayloadWithNonce = JwtPayload & { nonce: string };

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
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  ApiResponse.ok(res, "user login successfully", {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
  });
};

export const oauthTokenExchange = async (req: Request, res: Response) => {
  const { code, nonce }: { code: string; nonce: string } = req.body;

  if (!code) throw ApiError.badRequest("Authorization code is required");

  const { idToken, accessToken, refreshToken } = await oauthTokenExchangeService(code);

  if (!idToken) ApiError.internalError("Internal Error: Failed to login customer");

  const decoded = jwt.decode(idToken, {complete: true}) as unknown as { payload: JwtPayloadWithNonce };

  if (decoded.payload.nonce !== nonce) {
    throw ApiError.unauthorized("Invalid nonce");
  };

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  ApiResponse.ok(res, "user login successfully", {
    idToken,
    accessToken,
  });
};

export const logoutCustomer = async (req: Request, res: Response) => {
  await logoutCustomerService(
    req.customer,
    req.cookies?.refreshToken as string,
  );

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
  if (req.cookies.refreshToken)
    throw ApiError.badRequest("You are already logged in");
  await forgotPasswordService(req.body);

  ApiResponse.ok(res, "Token is send to user's email successfully");
};

export const newPassword = async (
  req: Request<{ token: string }>,
  res: Response,
) => {
  if (req.cookies.refreshToken)
    throw ApiError.badRequest("You are already logged in");
  await newPasswordService(req.body, req.params.token);

  ApiResponse.ok(res, "Password reset successfully");
};

export const uploadAvatar = async (req: Request, res: Response) => {
  if (!req.file?.path) throw ApiError.badRequest("invalid file path");

  const { path } = req.file;
  const { id } = req.customer;

  const avatar = await uploadAvatarService({ path, id });

  ApiResponse.ok(res, "avatar uploaded successfully", avatar);
};

export const getCustomerTickets = async (req: Request<{ paymentId: string }>, res: Response) => {
  if (!req.params.paymentId) throw ApiError.badRequest("paymentId is required");

  const tickets = await getCustomerTicketsService({ id: req.customer.id, paymentId: req.params.paymentId });

  ApiResponse.ok(res, "user tickets fetch successfully", tickets);
};

export const getCustomerBookings = async (req: Request, res: Response) => {
  const bookings = await getCustomerBookingsService(req.customer);

  ApiResponse.ok(res, "user bookings fetch successfully", bookings);
};
