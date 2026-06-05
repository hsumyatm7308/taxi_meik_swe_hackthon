import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import prisma from './lib/prisma.js';
import crypto from 'crypto';
import { requireUser } from './lib/api-auth.js';
import { hashPassword } from 'better-auth/crypto';
import {
  serializeBooking,
  serializeDeposit,
  serializeIncompleteDeposit,
  serializeNotification,
  serializeUser,
} from './lib/serializers.js';
import { paymentUploadDir, uploadPaymentScreenshot } from './lib/payment-upload.js';
import { profilePhotoUploadDir, uploadProfilePhoto } from './lib/profile-photo-upload.js';
import {
  getBookingDeposit,
  getBookingPayment,
  serializeBookingWithFinancials,
} from './lib/booking-finance.js';
import { configureCoreMiddleware, configureStaticUploads } from './lib/app-config.js';
import driverRouter from '../routes/driverRoutes.js';
import adminRouter from '../routes/admin/apiRoutes.js';
import authRouter from '../routes/authRoutes.js';
import contactRouter from '../routes/contactRoutes.js';
import ownerRouter from './routes/owner.routes.js';
import adminVerificationsRouter from './routes/admin-verifications.routes.js';
import ownerCarsRouter from './routes/owner-cars.routes.js';
import carsRouter from './routes/cars.routes.js';
import driverBookingsRouter from './routes/driver-bookings.routes.js';
import ownerBookingsRouter from './routes/owner-bookings.routes.js';
import adminBookingsRouter from './routes/admin-bookings.routes.js';
import agreementsRouter from './routes/agreements.routes.js';
import bookingPaymentsRouter from './routes/booking-payments.routes.js';
import aiMatchingRouter from './routes/ai-matching.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

configureCoreMiddleware(app);
configureStaticUploads(app, __dirname, paymentUploadDir, profilePhotoUploadDir);

app.use("/api", authRouter);
app.use("/api", contactRouter);

// Mount driver routes
app.use("/api/driver", driverRouter);

// Mount admin routes
app.use("/api/admin", adminRouter);

app.get("/api/user/profile", async (req, res) => {
  try {
    const authUser = await requireUser(req, res);
    if (!authUser) return;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { ownerProfile: true, driverProfile: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ data: serializeUser(user) });
  } catch (error: any) {
    console.error("Get user profile error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/user/profile", async (req, res) => {
  try {
    const authUser = await requireUser(req, res);
    if (!authUser) return;

    const { name, phone, password } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }

    const updateData: any = {
      name: name.trim(),
    };

    if (phone && phone.trim() !== "") {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: phone.trim(),
          NOT: { id: authUser.id }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: "Phone number is already in use" });
      }
      updateData.phone = phone.trim();
    }

    if (password && password.trim() !== "") {
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      include: { ownerProfile: true, driverProfile: true },
    });

    return res.json({ data: serializeUser(updatedUser) });
  } catch (error: any) {
    console.error("Update user profile error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/user/profile/photo", uploadProfilePhoto, async (req, res) => {
  try {
    const authUser = await requireUser(req, res);
    if (!authUser) return;

    if (!req.file) {
      return res.status(400).json({ error: "Profile photo is required" });
    }

    const photoUrl = `/uploads/profile/${req.file.filename}`;
    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: { profilePhoto: photoUrl, image: photoUrl },
      include: { ownerProfile: true, driverProfile: true },
    });

    return res.json({ data: serializeUser(user) });
  } catch (error: any) {
    console.error("Upload profile photo error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/api/owner", ownerRouter);
app.use("/api/admin", adminVerificationsRouter);
app.use("/api/owner/cars", ownerCarsRouter);
app.use("/api/cars", carsRouter);
app.use("/api/driver/bookings", driverBookingsRouter);
app.use("/api/owner/bookings", ownerBookingsRouter);
app.use("/api/admin/bookings", adminBookingsRouter);
app.use("/api/agreements", agreementsRouter);
app.use("/api", bookingPaymentsRouter);
app.use("/api", aiMatchingRouter);

app.post("/api/bookings/:id/deposits", uploadPaymentScreenshot, async (req, res) => {
  try {
    const authUser = await requireUser(req, res, ["DRIVER"]);
    if (!authUser) return;

    const application = await prisma.carApplication.findFirst({
      where: {
        id: String(req.params.id),
        driverId: authUser.id,
        ownerApprovalStatus: "APPROVED",
        adminApprovalStatus: "APPROVED",
      },
      include: { car: true },
    }) as any;

    if (!application) {
      return res.status(404).json({ error: "Approved booking not found" });
    }

    const payment = await getBookingPayment(application.id, "DRIVER");
    if (payment?.status !== "confirmed") {
      return res.status(400).json({ error: "Payment must be confirmed before submitting deposit" });
    }

    const method = String(req.body.payment_method || req.body.method || "");
    if (!method) {
      return res.status(400).json({ error: "Deposit payment method is required" });
    }

    const screenshotUrl = req.file ? `/uploads/payments/${req.file.filename}` : null;
    if (!screenshotUrl) {
      return res.status(400).json({ error: "Deposit screenshot is required" });
    }

    await prisma.$executeRaw`
      INSERT INTO booking_deposits (
        id, booking_id, driver_id, amount, status, payment_method, screenshot_url,
        paid_at, created_at, updated_at
      )
      VALUES (
        ${crypto.randomUUID()}::uuid,
        ${application.id}::uuid,
        ${authUser.id}::uuid,
        ${String(application.car.depositAmount || 0)}::decimal,
        'held',
        ${method},
        ${screenshotUrl},
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT (booking_id) DO UPDATE SET
        driver_id = EXCLUDED.driver_id,
        amount = EXCLUDED.amount,
        status = 'held',
        payment_method = EXCLUDED.payment_method,
        screenshot_url = EXCLUDED.screenshot_url,
        paid_at = NOW(),
        released_at = NULL,
        deducted_amount = NULL,
        deduction_reason = NULL,
        updated_at = NOW()
    `;

    const deposit = await getBookingDeposit(application.id);
    return res.json({ data: serializeDeposit(deposit) });
  } catch (error: any) {
    console.error("Submit deposit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/bookings/:id/deposits", async (req, res) => {
  try {
    const authUser = await requireUser(req, res);
    if (!authUser) return;

    const application = await prisma.carApplication.findFirst({
      where: {
        id: String(req.params.id),
        ...(authUser.role === "DRIVER"
          ? { driverId: authUser.id }
          : authUser.role === "OWNER"
            ? { ownerId: authUser.id }
            : {}),
      },
      include: { car: true },
    }) as any;

    if (!application) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const deposit = await getBookingDeposit(application.id);
    return res.json({ data: deposit ? serializeDeposit(deposit) : serializeIncompleteDeposit(application) });
  } catch (error: any) {
    console.error("Get booking deposit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/driver/deposits", async (req, res) => {
  try {
    const authUser = await requireUser(req, res, ["DRIVER", "ADMIN"]);
    if (!authUser) return;

    const deposits = authUser.role === "ADMIN"
      ? await prisma.$queryRaw<Array<any>>`
          SELECT * FROM booking_deposits ORDER BY created_at DESC
        `
      : await prisma.$queryRaw<Array<any>>`
          SELECT * FROM booking_deposits
          WHERE driver_id = ${authUser.id}::uuid
          ORDER BY created_at DESC
        `;

    return res.json({ data: deposits.map(serializeDeposit) });
  } catch (error: any) {
    console.error("Get driver deposits error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/owner/deposits", async (req, res) => {
  try {
    const authUser = await requireUser(req, res, ["OWNER", "ADMIN"]);
    if (!authUser) return;

    const deposits = authUser.role === "ADMIN"
      ? await prisma.$queryRaw<Array<any>>`
          SELECT d.* FROM booking_deposits d ORDER BY d.created_at DESC
        `
      : await prisma.$queryRaw<Array<any>>`
          SELECT d.* FROM booking_deposits d
          INNER JOIN car_applications a ON a.id = d.booking_id
          WHERE a.owner_id = ${authUser.id}::uuid
          ORDER BY d.created_at DESC
        `;

    return res.json({ data: deposits.map(serializeDeposit) });
  } catch (error: any) {
    console.error("Get owner deposits error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/admin/deposits/:id/freeze", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    await prisma.$executeRaw`
      UPDATE booking_deposits SET status = 'frozen', updated_at = NOW()
      WHERE id = ${req.params.id}::uuid
    `;

    const [deposit] = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM booking_deposits WHERE id = ${req.params.id}::uuid LIMIT 1
    `;

    if (!deposit) return res.status(404).json({ error: "Deposit not found" });
    return res.json({ data: serializeDeposit(deposit) });
  } catch (error: any) {
    console.error("Freeze deposit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/admin/deposits/:id/release", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    await prisma.$executeRaw`
      UPDATE booking_deposits
      SET status = 'released', released_at = NOW(), updated_at = NOW()
      WHERE id = ${req.params.id}::uuid
    `;

    const [deposit] = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM booking_deposits WHERE id = ${req.params.id}::uuid LIMIT 1
    `;

    if (!deposit) return res.status(404).json({ error: "Deposit not found" });
    return res.json({ data: serializeDeposit(deposit) });
  } catch (error: any) {
    console.error("Release deposit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/admin/deposits/:id/deduct", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    await prisma.$executeRaw`
      UPDATE booking_deposits
      SET status = 'deducted',
          deducted_amount = ${String(req.body.amount || 0)}::decimal,
          deduction_reason = ${req.body.reason || null},
          updated_at = NOW()
      WHERE id = ${req.params.id}::uuid
    `;

    const [deposit] = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM booking_deposits WHERE id = ${req.params.id}::uuid LIMIT 1
    `;

    if (!deposit) return res.status(404).json({ error: "Deposit not found" });
    return res.json({ data: serializeDeposit(deposit) });
  } catch (error: any) {
    console.error("Deduct deposit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/bookings/:id/cancel", async (req, res) => {
  try {
    const authUser = await requireUser(req, res, ["DRIVER", "OWNER", "ADMIN"]);
    if (!authUser) return;

    const existing = await prisma.carApplication.findFirst({
      where: {
        id: req.params.id,
        ...(authUser.role === "DRIVER"
          ? { driverId: authUser.id }
          : authUser.role === "OWNER"
            ? { ownerId: authUser.id }
            : {}),
      },
      include: { car: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const application = await prisma.carApplication.update({
      where: { id: existing.id },
      data: {
        ownerApprovalStatus: "REJECTED",
        adminApprovalStatus: "REJECTED",
        approvedAt: null,
      },
      include: {
        car: { include: { carImages: true, owner: { include: { ownerProfile: true } } } },
        driver: { include: { driverProfile: true } },
        owner: { include: { ownerProfile: true } },
      },
    });

    return res.json({ data: await serializeBookingWithFinancials(application) });
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/notifications", async (req, res) => {
  try {
    const authUser = await requireUser(req, res);
    if (!authUser) return;

    const notifications = await prisma.notification.findMany({
      where: { receiverId: authUser.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ data: notifications.map(serializeNotification) });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/notifications/:id/read", async (req, res) => {
  try {
    const authUser = await requireUser(req, res);
    if (!authUser) return;

    await prisma.notification.updateMany({
      where: { id: req.params.id, receiverId: authUser.id },
      data: { isRead: true },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/notifications/read-all", async (req, res) => {
  try {
    const authUser = await requireUser(req, res);
    if (!authUser) return;

    await prisma.notification.updateMany({
      where: { receiverId: authUser.id, isRead: false },
      data: { isRead: true },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Mark all notifications read error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/notifications/unread-count", async (req, res) => {
  try {
    const authUser = await requireUser(req, res);
    if (!authUser) return;

    const count = await prisma.notification.count({
      where: { receiverId: authUser.id, isRead: false },
    });

    return res.json({ data: count });
  } catch (error: any) {
    console.error("Get unread notification count error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Better Auth Route Handler (catch-all — must come LAST) ───────────────────
app.all("/api/auth/*splat", toNodeHandler(auth));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
