import { eq } from "drizzle-orm";
import { db } from "../../../db";
import {
  paymentTable,
  seatsTable,
  seatStatusTable,
  showsTable,
  ticketTable,
  tokensTable,
  usersTable,
} from "../../../db/schema";
import ApiError from "../../../common/utils/api-error";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
} from "../../../common/utils/jwt.utils";
import crypto from "crypto";
import sendMail from "../../../common/nodemailer/nodemailer.config";
import {
  forgotPasswordMail,
  verificationMail,
} from "../../../common/nodemailer/emails";
import { and } from "drizzle-orm";
import { gt } from "drizzle-orm";
import { uploadImage } from "../../../common/utils/cloudinary.utils";
import axios from "axios";

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
    })
    .returning({ id: usersTable.id });

  if (!user)
    throw ApiError.internalError("Internal Error: Failed to register user");

  await db
    .insert(tokensTable)
    .values({
      token: hashedToken,
      tokenType: "verificationToken",
      tokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      userId: user?.id,
    })
    .returning();

  sendMail(
    email,
    "Verify your email",
    verificationMail(
      `${firstName} ${lastName}`,
      `${process.env.CLIENT_API}/verification/${rawToken}`,
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

  const [checkToken] = await db
    .update(tokensTable)
    .set({
      isUsed: true,
    })
    .where(
      and(
        eq(tokensTable.tokenType, "verificationToken"),
        eq(tokensTable.token, hashed),
      ),
    )
    .returning({
      verificationTokenExpiry: tokensTable.tokenExpiry,
      userId: tokensTable.userId,
    });

  if (!checkToken || checkToken.verificationTokenExpiry! < new Date())
    throw ApiError.badRequest("Token is invalid or expires");

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      isVerified: true,
    })
    .where(eq(usersTable.id, checkToken.userId))
    .returning();

  if (!updatedUser)
    throw ApiError.internalError(
      "Internal Error: Failed to verify the user, please try after some time!",
    );
};

export const loginCustomerService = async (
  data: Pick<RegisterCutomer, "email" | "password">,
) => {
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
      avatar: usersTable.avatar,
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

  const [token] = await db
    .insert(tokensTable)
    .values({
      token: generateHashtoken(refreshToken),
      tokenType: "refreshToken",
      userId: user.id,
    })
    .returning();

  if (!token)
    throw ApiError.internalError("Internal Error: Failed to login user");

  return { user, accessToken, refreshToken };
};

export const oauthTokenExchangeService = async (code: string) => {

  try {
    const response = await axios.post("http://localhost:3001/o/token", {
      code,
      clientId: process.env.client_id,
      clientSecret: process.env.client_secret,
      grant_type: "authorization_code",
      redirect_url: "http://localhost:5173/callback/oauth/login",
    }, { withCredentials: true });
    return response.data.data;
  } catch (error) {
    throw ApiError.internalError("Internal Error: Failed to exchange OAuth token");
  }
};

export const logoutCustomerService = async (
  data: CustomerTypes,
  refreshToken: string,
): Promise<void> => {
  const { id } = data;

  const [user] = await db
    .update(usersTable)
    .set({ logoutAt: new Date(Date.now()) })
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) throw ApiError.unauthorized("You are not authorized to do this!");

  await db
    .update(tokensTable)
    .set({ isUsed: true })
    .where(
      and(
        eq(tokensTable.userId, user.id),
        eq(tokensTable.tokenType, "refreshToken"),
        eq(tokensTable.isUsed, false),
        eq(tokensTable.token, generateHashtoken(refreshToken)),
      ),
    )
    .returning();
};

export const refreshCustomerService = async (data: {
  refreshToken: string;
}) => {
  const { refreshToken } = data;

  if (!refreshToken) throw ApiError.badRequest("Invalid token!");

  const [token] = await db
    .update(tokensTable)
    .set({ isUsed: true })
    .where(
      and(
        eq(tokensTable.tokenType, "refreshToken"),
        eq(tokensTable.isUsed, false),
        eq(tokensTable.token, generateHashtoken(refreshToken)),
      ),
    )
    .returning();

  if (!token) throw ApiError.unauthorized("You are not authorized");

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, token.userId));

  if (!user) throw ApiError.notFound("user not found");

  const newAccessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({ id: user.id });

  await db.insert(tokensTable).values({
    token: generateHashtoken(newRefreshToken),
    userId: user.id,
    tokenType: "refreshToken",
  });

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
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user) throw ApiError.notFound("Invalid email id");

  await db.insert(tokensTable).values({
    token: hashedToken,
    tokenType: "passwordResetToken",
    tokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
    userId: user.id,
  });

  sendMail(
    email,
    "Forgot password",
    forgotPasswordMail(
      `${user.firstName} ${user.lastName}`,
      `${process.env.CLIENT_API}/reset-password/${rawToken}`,
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
    const [checkToken] = await db
      .update(tokensTable)
      .set({
        isUsed: true,
        tokenExpiry: null,
      })
      .where(
        and(
          eq(tokensTable.tokenType, "passwordResetToken"),
          eq(tokensTable.isUsed, false),
          eq(tokensTable.token, generateHashtoken(token)),
          gt(tokensTable.tokenExpiry, new Date()),
        ),
      )
      .returning();

    if (!checkToken) throw ApiError.badRequest("Token is invalid or expires");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(usersTable)
      .set({
        password: hashedPassword,
      })
      .where(eq(usersTable.id, checkToken.userId));
  } catch (err: unknown) {
    if (err instanceof Error) throw ApiError.internalError(err.message);
    throw ApiError.internalError(
      "Internal Error: Failed to reset the user password",
    );
  }
};

export const uploadAvatarService = async ({
  path,
  id,
}: {
  path: string;
  id: string;
}) => {
  const uploadedFile = await uploadImage(path);

  if (!uploadedFile)
    throw ApiError.internalError(
      "Internal Error: Failed to upload image, try again after some time",
    );

  const [user] = await db
    .update(usersTable)
    .set({ avatar: uploadedFile })
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) throw ApiError.notFound();

  return user.avatar;
};

export const getCustomerTicketsService = async ({ id, paymentId }: { id: string, paymentId: string }) => {
  const tickets = await db
    .select({
      seatType: seatsTable.seatType,
      seatName: seatsTable.seatName,
      seatPrice: seatsTable.seatPrice,
      showName: showsTable.showName,
      showStart: showsTable.showStart,
      showEnd: showsTable.showEnd,
      createdAt: ticketTable.createdAt,
      ticketId: ticketTable.ticketId,
    })
    .from(ticketTable)
    .innerJoin(showsTable, eq(showsTable.showId, ticketTable.showId))
    .innerJoin(seatsTable, eq(seatsTable.seatId, ticketTable.seatId))
    .innerJoin(paymentTable, eq(paymentTable.paymentId, ticketTable.paymentId))
    .where(and(eq(ticketTable.paymentId, paymentId), eq(ticketTable.userId, id)));

  return tickets.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
};

export const getCustomerBookingsService = async ({ id }: { id: string }) => {
  const bookings = await db
    .select()
    .from(paymentTable)
    .where(eq(paymentTable.userId, id))

  return bookings;
};
