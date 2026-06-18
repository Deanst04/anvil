import { Router } from "express";
import fileUploadMiddleware from "../middlewares/file-upload.middleware";
import { fileUploadController } from "../controllers/file-upload.controller";
import fileValidationMiddleware from "../middlewares/file-validation.middleware";

const router = Router();

router.post(
  "/",
  fileUploadMiddleware,
  fileValidationMiddleware,
  fileUploadController,
);

export default router;
