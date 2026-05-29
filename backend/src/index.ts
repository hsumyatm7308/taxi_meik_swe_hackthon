import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from '../routes/authRoutes.js';
import driverRouter from '../routes/driverRoutes.js';
import adminRouter from '../routes/admin/apiRoutes.js';
import contactRouter from '../routes/contactRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const paymentUploadDir = path.resolve(__dirname, '../uploads/payments');
fs.mkdirSync(paymentUploadDir, { recursive: true });
const paymentUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, paymentUploadDir),
    filename: (_req, file, cb) => {
      const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
      cb(null, `${uniqueId}_${safeName}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
]);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Enable CORS
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

// Parse cookies
app.use(cookieParser());

// JSON parser for our custom routes
app.use(express.json({ limit: '10mb' }));

// Global rate limit
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Serve uploaded KYC documents as static files
app.use('/uploads/kyc', express.static(path.resolve(__dirname, '../uploads/kyc')));
app.use('/uploads/payments', express.static(paymentUploadDir));

app.use("/api", authRouter);

// Mount driver routes
app.use("/api/driver", driverRouter);

// Mount admin routes
app.use("/api/admin", adminRouter);

// Mount public routes
app.use("/api", contactRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
