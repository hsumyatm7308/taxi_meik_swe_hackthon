import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import helmet from "helmet";
import path from "path";

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
]);

export function configureCoreMiddleware(app: Express) {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }));

  app.use(cookieParser());
  app.use(express.json({ limit: "80mb" }));
}

export function configureStaticUploads(
  app: Express,
  serverDirname: string,
  paymentUploadDir: string,
  profilePhotoUploadDir?: string,
) {
  app.use("/uploads/kyc", express.static(path.resolve(serverDirname, "../uploads/kyc")));
  app.use("/uploads/payments", express.static(paymentUploadDir));
  if (profilePhotoUploadDir) {
    app.use("/uploads/profile", express.static(profilePhotoUploadDir));
  }
}
