import { pgTable, varchar, uuid, boolean, timestamp, pgEnum, text } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["customer", "seller", "admin"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  firstName: varchar("first_name", { length: 45 }).notNull(),
  lastName: varchar("last_name", { length: 45 }),
  
  email: varchar("email", { length: 322 }).notNull().unique(),
  isVerified: boolean("is_verified").default(false).notNull(),
  
  password: varchar("password", { length: 66 }).notNull(),
  role: roleEnum("role").default("customer").notNull(),
  
  verificationToken: text("verification_token"),
  passwordResetToken: text("password_reset_token"),
  refreshToken: text("refresh_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  
  logoutAt: timestamp("logout_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date())
});