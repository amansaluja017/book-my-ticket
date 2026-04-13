import BaseDto from "../../common/utils/dto.config";
import { z } from "zod";

class RegisterDto extends BaseDto {
  static schema = z
    .object({
      firstName: z.string().min(2).max(45),
      lastName: z.string().min(2).max(45).nullable(),
      email: z.string(),
      password: z.string().min(8),
    })
    .strict();
}

class LoginDto extends BaseDto {
  static schema = z
    .object({
      email: z.string(),
      password: z.string().min(8),
    })
    .strict();
}

export { RegisterDto, LoginDto };
