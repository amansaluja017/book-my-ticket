import { eq } from "drizzle-orm";
import { db } from "../../db";
import { screensTable } from "../../db/schema";
import { and } from "drizzle-orm";
import ApiError from "../../common/utils/api-error";
import { sql } from "drizzle-orm";

export type screenTypeEnum =
  | "IMAX"
  | "Dolby Atmos"
  | "3D"
  | "Standard"
  | "VIP Lounge";

export const registerScreenService = async ({
  name,
  type,
}: {
  name: string;
  type: screenTypeEnum;
}) => {

  await db.transaction(async (tsx) => {
    const [screen] = await tsx
      .select()
      .from(screensTable)
      .where(
        and(
          eq(screensTable.screenName, name),
          eq(screensTable.screenType, type),
        ),
      );

    if (screen)
      throw ApiError.badRequest(
        "Screen is already exists with this name and type",
      );

    const [createdScreen] = await tsx
      .insert(screensTable)
      .values({ screenName: name, screenType: type })
      .returning();

    if (!createdScreen)
      throw ApiError.internalError(
        "Intrnal error: Failed to create screen, try again later after some time",
      );

    await tsx.execute(sql`
        INSERT INTO seats (seat_name, seat_price, seat_type, screen_id)
        SELECT
            CASE
                WHEN seat_num <= 10 THEN CONCAT('S', seat_num)
                WHEN seat_num <= 30 THEN CONCAT('G', seat_num - 10)
                ELSE CONCAT('R', seat_num - 30)
            END,

            CASE
                WHEN seat_num <= 10 THEN 550
                WHEN seat_num <= 30 THEN 700
                ELSE 1100
            END,

            CASE
                WHEN seat_num <= 10 THEN 'Silver'
                WHEN seat_num <= 30 THEN 'Gold'
                ELSE 'Recliner'
            END::seat_type,

            ${createdScreen.screenId}

        FROM generate_series(1, 40) AS seat_num;
      `);
  });
};