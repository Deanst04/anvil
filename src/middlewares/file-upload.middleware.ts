import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from "../validations/file.validation";
import { NextFunction, Request, Response } from "express";

// export default function fileUploadMiddleware() {
const storage = multer.diskStorage({
  destination: "storage/temp",
  filename(_req, file, callback) {
    const fileName = randomUUID();
    const fileExt = path.extname(file.originalname);
    callback(null, `${fileName}${fileExt}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(_req, file, callback) {
    const mimetype = file.mimetype;
    if ((ALLOWED_MIME_TYPES as readonly string[]).includes(mimetype)) {
      callback(null, true);
    } else callback(new Error(`Invalid file type: ${mimetype}`));
  },
});
const uploadSingleFile = upload.single("file");

export default function fileUploadMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  uploadSingleFile(req, res, (e) => {
    if (e) {
      return res.status(400).json({
        success: false,
        message: e.message,
      });
    }
    next();
  });
}
// }
