import { and, asc } from "drizzle-orm";
import { db } from "../../db";
import {
  screensTable,
  showsTable,
} from "../../db/schema";
import { eq } from "drizzle-orm";
import { screenTypeEnum } from "../screen/screen.service";
import ApiError from "../../common/utils/api-error";
import { sql } from "drizzle-orm";

export const createShowService = async ({
  name,
  screenName,
  screenType,
  start,
  end,
}: {
  name: string;
  screenName: string;
  screenType: screenTypeEnum;
  start: Date;
  end: Date;
  }) => {
  const [screen] = await db
    .select()
    .from(screensTable)
    .where(
      and(
        eq(screensTable.screenName, screenName),
        eq(screensTable.screenType, screenType),
      ),
    );

  if (!screen) throw ApiError.notFound("Screen not found");

  await db.transaction(async (tsx) => {
    const [show] = await tsx
      .insert(showsTable)
      .values({
        showName: name,
        screenId: screen.screenId,
        showStart: start,
        showEnd: end,
        showDuration: String((Number(end) - Number(start)) / (1000 * 60 * 60)),
      })
      .returning();

    if (!show)
      throw ApiError.internalError(
        "Internal Error: Failed to add show, try again later after some time",
      );

    await tsx.execute(sql`
      INSERT INTO seats_status (seat_id, show_id)
      SELECT seat.seat_id, s.show_id
      FROM shows s
      JOIN seats seat ON seat.screen_id = s.screen_id
      ON CONFLICT (seat_id, show_id) DO NOTHING;
      `);
  });
};

export const getShowsService = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  const shows = await db
    .select({
      showId: showsTable.showId,
      showName: showsTable.showName,
      showDuration: showsTable.showDuration,
      showStart: showsTable.showStart,
      showEnd: showsTable.showEnd,
      screenId: screensTable.screenId,
      screenName: screensTable.screenName,
      screenType: screensTable.screenType,
    })
    .from(showsTable)
    .innerJoin(screensTable, eq(showsTable.screenId, screensTable.screenId))
    .limit(limit - 0)
    .offset(limit * (page - 1))
    .orderBy(asc(showsTable.showStart));

  if (!shows)
    throw ApiError.internalError(
      "Internal Error: Failed to fetch shows, try again later",
    );

  return shows;
};
