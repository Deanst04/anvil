import { Request, Response } from "express";

export function fileUploadController(req: Request, res: Response) {
  const file = req.file;
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Bad Request",
    });
  }
  return res.status(200).json({
    success: true,
    file,
  });
}
