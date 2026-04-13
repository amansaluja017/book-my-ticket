import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  uuid,
  boolean,
  timestamp,
  pgEnum,
  text,
  decimal,
  primaryKey,
  integer,
  check,
  numeric,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["customer", "admin"]);
export const tokenEnum = pgEnum("token_type", [
  "refreshToken",
  "verificationToken",
  "passwordResetToken",
]);
export const seatStatusEnum = pgEnum("seat_status", [
  "booked",
  "locked",
  "available",
]);
export const seatTypeEnum = pgEnum("seat_type", ["Silver", "Gold", "Recliner"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "waiting",
  "confirmed",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "success",
  "failed",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "upi",
  "card",
  "netbanking",
]);
export const screenTypeEnum = pgEnum("screen_type", [
  "IMAX",
  "Dolby Atmos",
  "3D",
  "Standard",
  "VIP Lounge",
]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  firstName: varchar("first_name", { length: 45 }).notNull(),
  lastName: varchar("last_name", { length: 45 }),

  email: varchar("email", { length: 322 }).notNull().unique(),
  isVerified: boolean("is_verified").default(false).notNull(),

  password: varchar("password", { length: 66 }).notNull(),
  role: roleEnum("role").default("customer").notNull(),

  logoutAt: timestamp("logout_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const tokensTable = pgTable("tokens", {
  tokenId: uuid("token_id").primaryKey().defaultRandom(),
  token: text("token").notNull(),

  userId: uuid("user_id")
    .references(() => usersTable.id, {
      onDelete: "cascade",
    })
    .notNull(),

  tokenType: tokenEnum("token_type").notNull(),
  tokenExpiry: timestamp("token_expiry"),
  isUsed: boolean("is_used").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const screensTable = pgTable("screens", {
  screenId: uuid("screen_id").primaryKey().defaultRandom(),

  screenName: varchar("screen_name", { length: 100 }).notNull(),
  screenType: screenTypeEnum("screen_type").default("Standard").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const showsTable = pgTable(
  "shows",
  {
    showId: uuid("show_id").primaryKey().defaultRandom(),

    showName: text("show_name").notNull(),

    screenId: uuid("screen_id")
      .references(() => screensTable.screenId, {onDelete: "cascade"})
      .notNull(),

    showStart: timestamp("show_start").notNull(),
    showEnd: timestamp("show_end").notNull(),
    showDuration: numeric("show_duration", {
      precision: 10,
      scale: 2,
    }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [check("show_duration", sql`${table.showDuration} > 0`)],
);

export const seatsTable = pgTable("seats", {
  seatId: uuid("seat_id").primaryKey().defaultRandom(),

  seatName: varchar("seat_name", { length: 10 }).notNull(),

  seatPrice: integer("seat_price").notNull(),
  seatType: seatTypeEnum("seat_type").notNull(),

  screenId: uuid("screen_id")
    .references(() => screensTable.screenId, { onDelete: "cascade" })
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

// export const bookingsTable = pgTable("bookings", {
//   bookingId: uuid("booking_id").primaryKey().defaultRandom(),

//   showId: uuid("show_id").references(() => showsTable.showId),
//   amount: integer("amount").notNull(),

//   userId: uuid("user_id").references(() => usersTable.id),

//   bookingStatus: bookingStatusEnum("booking_status")
//     .default("waiting")
//     .notNull(),

//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

export const seatStatusTable = pgTable(
  "seats_status",
  {
    seatId: uuid("seat_id")
      .references(() => seatsTable.seatId)
      .notNull(),

    seatStatus: seatStatusEnum("seat_status").default("available").notNull(),

    showId: uuid("show_id")
      .references(() => showsTable.showId, {onDelete: "cascade"})
      .notNull(),

    lockExpiry: timestamp("lock_expiry"),

    userId: uuid("user_id").references(() => usersTable.id),

    // bookingId: uuid("booking_id").references(() => bookingsTable.bookingId),

    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({ columns: [table.seatId, table.showId] }),
    check(
      "user_check_while_booking",
      sql`${table.seatStatus} <> 'booked' OR ${table.userId} IS NOT NULL`,
    ),
  ],
);

export const ticketTable = pgTable("tickets", {
  ticketId: uuid("ticket_id").primaryKey().defaultRandom(),

  // bookingId: uuid("booking_id")
  //   .references(() => bookingsTable.bookingId)
  //   .notNull(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentTable = pgTable("payments", {
  paymentId: uuid("payment_id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),

  amount: integer("amount").notNull(),

  paymentStatus: paymentStatusEnum("payment_status")
    .default("pending")
    .notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),

  transactionId: text("transaction_id").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoiceTable = pgTable("invoices", {
  invoiceId: uuid("invoice_id").primaryKey().defaultRandom(),

  paymentId: uuid("payment_id")
    .references(() => paymentTable.paymentId)
    .notNull(),
  userId: uuid("user_id")
    .references(() => usersTable.id)
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
