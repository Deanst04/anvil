import { Request, Response } from "express";
import prisma from "../infrastructure/prisma";

export async function fileUploadController(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      message: "Bad Request",
    });
  }
  try {
    const event = await prisma.event.create({
      data: {
        type: "file.upload",
        payload: {
          tempPath: file.path,
          objectKey: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      },
    });
    return res.status(202).json({
      success: true,
      message: "File upload job accepted",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload file",
    });
  }
}
