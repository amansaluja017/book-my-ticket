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

class ForgotPasswordDto extends BaseDto {
  static schema = z
    .object({
      email: z.string(),
    })
    .strict();
}

class NewPasswordDto extends BaseDto {
  static schema = z
    .object({
      newPassword: z.string().min(8),
      confirmPassword: z.string().min(8),
    })
    .strict();
}

export { RegisterDto, LoginDto, ForgotPasswordDto, NewPasswordDto };
