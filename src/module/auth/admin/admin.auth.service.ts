import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { tokensTable, usersTable } from "../../../db/schema";
import ApiError from "../../../common/utils/api-error";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../common/utils/jwt.utils";
import crypto from "crypto";
import { and } from "drizzle-orm";

interface RegisterCutomer {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface adminTypes {
  id: string;
  email: string;
  role: "admin";
}

const generateHashtoken = function (token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const registerAdminService = async (
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

  const [user] = await db
    .insert(usersTable)
    .values({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true
    })
    .returning({ id: usersTable.id });

  if (!user)
    throw ApiError.internalError("Internal Error: Failed to register user");

  return user;
};

export const loginAdminService = async (
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

  return { user: user, accessToken, refreshToken };
};

export const logoutAdminService = async (
  data: adminTypes,
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

export const refreshAdminService = async (data: {
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

export const adminProfileService = async (
  data: adminTypes,
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
