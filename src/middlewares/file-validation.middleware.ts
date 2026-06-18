import { NextFunction, Request, Response } from "express";
import { fileUploadSchema } from "../validations/file.validation";

export default function fileValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      message: "File is required",
    });
  }
  const results = fileUploadSchema.safeParse(file);
  if (!results.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: results.error.flatten().fieldErrors,
    });
  }
  next();
}
