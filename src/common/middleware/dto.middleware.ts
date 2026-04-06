import { NextFunction, Request, Response } from "express";
import z from "zod";
import ApiError from "../utils/api-error";

type DtoClassTypes = {
  schema: z.ZodTypeAny;
  validate: (data: unknown) => { error: z.ZodError | null; data: any };
};

const validate = (dtoClass: DtoClassTypes) => {
  return (req: Request, _: Response, next: NextFunction) => {
    const { error, data } = dtoClass.validate(req.body);

    if (error) {
      const errors = error.issues.map(
        (e) =>
          `${e.code}\n${e.message} ${e.path}\n --------------------------- \n`,
      );
      throw ApiError.badRequest(errors.join(" "));
    }

    req.body = data;
    next();
  };
};

export default validate;
