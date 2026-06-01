import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export default function validationMiddleware(
  schema: ZodSchema,
  target: "body" | "params" | "query" = "body",
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let value = req[target];
      if (value === undefined || value === null) {
        value = {};
      }
      const results = await schema.safeParseAsync(value);
      if (!results.success) {
        res.status(422).json({
          message: "Validation failed",
          errors: results.error.flatten().fieldErrors,
        });
        return;
      } else {
        req[target] = results.data;
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}
