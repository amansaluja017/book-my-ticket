import { z } from "zod";

class BaseDto {
  static schema: z.ZodTypeAny;

  static validate(data: unknown): { error: z.ZodError | null; data: any } {
    const { success, data: parsedData, error } = this.schema.safeParse(data);

    if (!success) return { error, data: null };

    return { error: null, data: parsedData };
  }
}

export default BaseDto;
