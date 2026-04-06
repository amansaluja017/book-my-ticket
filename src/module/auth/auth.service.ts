import { eq } from "drizzle-orm";
import { db } from "../../db";
import { usersTable } from "../../db/schema";
import ApiError from "../../common/utils/api-error";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
} from "../../common/utils/jwt.utils";
import crypto from "crypto";
import sendMail from "../../common/nodemailer/nodemailer.config";
import {
  forgotPasswordMail,
  verificationMail,
} from "../../common/nodemailer/emails";

interface RegisterCutomer {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CustomerTypes {
  id: string;
  email: string;
  role: "customer";
}

const generateHashtoken = function (token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const registerCustomerService = async (
  data: RegisterCutomer,
): Promise<Record<string, string>> => {
  const { firstName, lastName, email, password } = data;

  const [existedUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existedUser)
    throw ApiError.badRequest("email address is alread registerd!");

  const hashedPassword = await bcrypt.hash(password, 10);

  const { rawToken, hashedToken } = generateResetToken();

  const [user] = await db
    .insert(usersTable)
    .values({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationToken: hashedToken,
      verificationTokenExpiry: new Date(Date.now() + 30 * 60 * 1000),
    })
    .returning({ id: usersTable.id });

  if (!user)
    throw ApiError.internalError("Internal Error: Failed to register user");

  sendMail(
    email,
    "Verify your email",
    verificationMail(
      `${firstName} ${lastName}`,
      `http://localhost:3000/customer/verify/${rawToken}`,
    ),
  ).catch(console.log);

  return user;
};

export const verifyCustomerService = async (data: {
  token: string;
}): Promise<void> => {
  const { token } = data;

  if (!token) throw ApiError.badRequest("Invalid token");

  const hashed = generateHashtoken(token);

  const [user] = await db.select({ verificationTokenExpiry: usersTable.verificationTokenExpiry, id: usersTable.id }).from(usersTable).where(eq(usersTable.verificationToken, hashed));

  if (!user || user.verificationTokenExpiry! < new Date()) throw ApiError.badRequest("Token is invalid or expires");

  const [updatedUser] = await db
    .update(usersTable)
    .set({ isVerified: true, verificationToken: null, verificationTokenExpiry: null })
    .where(eq(usersTable.id, user.id))
    .returning();

  if (!updatedUser) throw ApiError.internalError("Internal Error: Failed to verify the user, please try after some time!")
};

export const loginCustomerService = async (
  data: Pick<RegisterCutomer, "email" | "password">,
): Promise<{
  user: Record<string, unknown>;
  accessToken: string;
  refreshToken: string;
}> => {
  const { email, password } = data;

  const [user] = await db
    .select({
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      password: usersTable.password,
      role: usersTable.role,
      id: usersTable.id,
      isVerified: usersTable.isVerified,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user) throw ApiError.unauthorized("email or password is incorrect");

  if (!user.isVerified)
    throw ApiError.badRequest("Please verify you email first!");

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword)
    throw ApiError.unauthorized("email or password is incorrect");

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({ id: user.id });

  const [updatedUser] = await db
    .update(usersTable)
    .set({ refreshToken: generateHashtoken(refreshToken) })
    .where(eq(usersTable.email, email))
    .returning({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      role: usersTable.role,
      isVerified: usersTable.isVerified,
    });

  if (!updatedUser)
    throw ApiError.internalError("Internal Error: Failed to login user");

  return { user: updatedUser, accessToken, refreshToken };
};

export const logoutCustomerService = async (
  data: CustomerTypes,
): Promise<void> => {
  const { id } = data;

  const [user] = await db
    .update(usersTable)
    .set({ refreshToken: null, logoutAt: new Date(Date.now()) })
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) throw ApiError.unauthorized("You are not authorized to do this!");
};

export const refreshCustomerService = async (data: {
  refreshToken: string;
}): Promise<Record<string, string>> => {
  const { refreshToken } = data;

  if (!refreshToken) throw ApiError.badRequest("Invalid token!");

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.refreshToken, generateHashtoken(refreshToken)));

  if (!user) throw ApiError.unauthorized("You are not authorized");

  const newAccessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  await db
    .update(usersTable)
    .set({ refreshToken: generateHashtoken(newRefreshToken) })
    .where(eq(usersTable.id, user.id));

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const customerProfileService = async (
  data: CustomerTypes,
): Promise<Record<string, unknown>> => {
  const { id } = data;

  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      isVerified: usersTable.isVerified,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
    })
    .from(usersTable)
    .where(eq(usersTable.id, id));

  if (!user) throw ApiError.notFound();

  return user;
};

export const forgotPasswordService = async (data: {
  email: string;
}): Promise<void> => {
  const { email } = data;

  const { rawToken, hashedToken } = generateResetToken();

  const [user] = await db
    .update(usersTable)
    .set({
      passwordResetToken: hashedToken,
      passwordResetExpiry: new Date(Date.now() + 15 * 60 * 1000),
    })
    .where(eq(usersTable.email, email))
    .returning();

  if (!user) throw ApiError.notFound("Invalid email id");

  sendMail(
    email,
    "Forgot password",
    forgotPasswordMail(
      `${user.firstName} ${user.lastName}`,
      `http://localhost:3000/customer/new-password/${rawToken}`,
    ),
  ).catch(console.log);
};

export const newPasswordService = async (
  data: { newPassword: string; confirmPassword: string },
  token: string,
): Promise<void> => {
  if (!token) throw ApiError.badRequest("Invalid token");

  const { newPassword, confirmPassword } = data;

  if (newPassword !== confirmPassword)
    throw ApiError.badRequest("new and confirm password are not equal");

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.passwordResetToken, generateHashtoken(token)));

    if (!user)
      throw ApiError.unauthorized(
        "You are not authenticated to do this action",
      );

    if (user.passwordResetExpiry! < new Date())
      throw ApiError.badRequest("Token expires");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(usersTable)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      })
      .where(eq(usersTable.passwordResetToken, generateHashtoken(token)));
  } catch (err: unknown) {
    if (err instanceof Error) throw ApiError.internalError(err.message);
    throw ApiError.internalError(
      "Internal Error: Failed to reset the user password",
    );
  }
};
