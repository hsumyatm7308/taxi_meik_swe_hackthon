import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import type { NextFunction, Request, Response } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const profilePhotoUploadDir = path.resolve(__dirname, "../../uploads/profile");
fs.mkdirSync(profilePhotoUploadDir, { recursive: true });

const profilePhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, profilePhotoUploadDir),
    filename: (_req, file, cb) => {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
      cb(null, `${uniqueId}_${safeName}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }

    cb(new Error("Only image files are allowed"));
  },
});

export function uploadProfilePhoto(req: Request, res: Response, next: NextFunction) {
  profilePhotoUpload.single("photo")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "Profile photo must be less than 5MB" });
      return;
    }

    res.status(400).json({ error: "Profile photo upload failed" });
  });
}
