import BaseDto from "../../common/utils/dto.config";
import { z } from "zod";

class RegisterDto extends BaseDto {
  static schema = z
    .object({
      name: z.string().min(2).max(45),
      screenName: z.string(),
      screenType: z.enum(["IMAX", "Dolby Atmos", "3D", "Standard", "VIP Lounge"]),
      start: z.string().transform((val) => new Date(val)),
      end: z.string().transform((val) => new Date(val))
    })
    .strict();
}

export { RegisterDto };