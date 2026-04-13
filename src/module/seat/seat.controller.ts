import { Response, Request } from "express";
import ApiError from "../../common/utils/api-error";
import { bookSeatsService, getSeatsService } from "./seat.service";
import ApiResponse from "../../common/utils/api-response";

export const getSeats = async (
  req: Request<{ showId: string; screenId: string }>,
  res: Response,
) => {
  if (!req.params.screenId || !req.params.showId)
    throw ApiError.badRequest("Invalid show or screen");

  const seats = await getSeatsService(req.params);

  ApiResponse.ok(res, "seats fetch successfully", seats);
};

export const bookSeats = async (req: Request, res: Response) => {
  const { id: userId } = req.customer;
  const { showId, seatIds }: { showId: string; seatIds: string[] } = req.body;

  if (!seatIds || !seatIds.length)
    throw ApiError.badRequest("seat id is Invalid");

  await bookSeatsService({ seatIds, showId, userId });

  ApiResponse.ok(res, "Your seat is booked");
};
