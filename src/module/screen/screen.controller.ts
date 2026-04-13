import { Response, Request } from "express";
import { registerScreenService } from "./screen.service";
import ApiResponse from "../../common/utils/api-response";

export const registerScreen = async (req: Request, res: Response) => {
  await registerScreenService(req.body);

  ApiResponse.ok(res, "screen created successfully");
};