import BaseDto from "../../common/utils/dto.config";
import { z } from "zod";

class RegisterDto extends BaseDto {
  static schema = z
    .object({
      name: z.string().min(2).max(45),
      type: z.enum(["IMAX", "Dolby Atmos", "3D", "Standard", "VIP Lounge"])
    })
    .strict();
}

export { RegisterDto };