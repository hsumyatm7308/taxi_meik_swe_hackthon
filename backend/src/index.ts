import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from '../routes/authRoutes.js';
import driverRouter from '../routes/driverRoutes.js';
import adminRouter from '../routes/admin/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// JSON parser for our custom routes
app.use(express.json());

// Serve uploaded KYC documents as static files
app.use('/uploads/kyc', express.static(path.resolve(__dirname, '../uploads/kyc')));

app.use("/api", authRouter);

// Mount driver routes
app.use("/api/driver", driverRouter);

// Mount admin routes
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
