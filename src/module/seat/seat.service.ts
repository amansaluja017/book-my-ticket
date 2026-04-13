import { db } from "../../db";
import {
  screensTable,
  seatsTable,
  seatStatusTable,
  showsTable,
  ticketTable,
} from "../../db/schema";
import { eq, inArray } from "drizzle-orm";
import ApiError from "../../common/utils/api-error";
import { and } from "drizzle-orm";

export const getSeatsService = async ({
  screenId,
  showId,
}: {
  screenId: string;
  showId: string;
}) => {
  const [show] = await db
    .select()
    .from(showsTable)
    .where(
      and(eq(showsTable.showId, showId), eq(showsTable.screenId, screenId)),
    );

  if (!show) throw ApiError.badRequest("Invaid request, no show found");

  const seats = await db
    .select({
      seatId: seatStatusTable.seatId,
      seatStatus: seatStatusTable.seatStatus,
      showId: seatStatusTable.showId,
      seatName: seatsTable.seatName,
      seatPrice: seatsTable.seatPrice,
      seatType: seatsTable.seatType,
      screenId: screensTable.screenId,
      screenName: screensTable.screenName,
      screenType: screensTable.screenType,
    })
    .from(seatStatusTable)
    .innerJoin(seatsTable, eq(seatsTable.seatId, seatStatusTable.seatId))
    .innerJoin(screensTable, eq(screensTable.screenId, seatsTable.screenId))
    .where(eq(seatStatusTable.showId, show.showId));

  if (!seats)
    throw ApiError.internalError(
      "Internal Error: Failed to fetch seats, try again later after some time",
    );

  return seats;
};

export const bookSeatsService = async ({
  seatIds,
  showId,
  userId,
}: {
  seatIds: string[];
  showId: string;
  userId: string;
}) => {
  await db.transaction(async (tx) => {
    const seat = await tx
      .select()
      .from(seatStatusTable)
      .where(
        and(
          eq(seatStatusTable.showId, showId),
          inArray(seatStatusTable.seatId, seatIds),
          eq(seatStatusTable.seatStatus, "booked"),
        ),
      )
      .for("update");

    if (seat.length) throw ApiError.badRequest("seat is already booked");

    await tx
      .update(seatStatusTable)
      .set({ seatStatus: "booked", userId })
      .where(
        and(
          eq(seatStatusTable.showId, showId),
          inArray(seatStatusTable.seatId, seatIds),
        ),
      );

    await tx.insert(ticketTable).values({ userId });
  });
};
