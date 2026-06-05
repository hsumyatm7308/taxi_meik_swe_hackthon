import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireUser } from "../lib/api-auth.js";
import {
  isApprovedOwner,
  serializeCar,
  serializeOwnerDocuments,
  serializeUser,
} from "../lib/serializers.js";

const router = Router();

router.get("/verifications/owners", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const owners = await prisma.user.findMany({
      where: {
        role: "OWNER",
        verificationStatus: "PENDING",
        ownerProfile: {
          is: {
            nrcFrontImage: { not: "" },
            nrcBackImage: { not: "" },
          },
        },
      },
      include: {
        ownerProfile: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ data: owners.map(serializeUser) });
  } catch (error: any) {
    console.error("Get pending owner verifications error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/verifications/owners/history", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const owners = await prisma.user.findMany({
      where: {
        role: "OWNER",
        verificationStatus: { in: ["APPROVED", "REJECTED"] },
      },
      include: {
        ownerProfile: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({ data: owners.map(serializeUser) });
  } catch (error: any) {
    console.error("Get owner verifications history error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verifications/owners/:userId", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const { userId } = req.params;
    const { status, notes } = req.body;
    const nextStatus = status === "verified" || status === "approved" ? "APPROVED" : status === "rejected" ? "REJECTED" : null;

    if (!nextStatus) {
      return res.status(400).json({ error: "Status must be verified, approved, or rejected" });
    }

    const owner = await prisma.user.findFirst({
      where: { id: userId, role: "OWNER" },
      include: {
        ownerProfile: true,
      },
    });

    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }

    const hasRequiredDocuments = !!owner.ownerProfile?.nrcFrontImage && !!owner.ownerProfile?.nrcBackImage;

    if (nextStatus === "APPROVED" && !hasRequiredDocuments) {
      return res.status(400).json({ error: "Owner must submit NRC front and NRC back before approval" });
    }

    const updatedOwner = await prisma.$transaction(async (tx) => {
      await tx.ownerProfile.updateMany({
        where: { userId },
        data: {
          adminApprovalStatus: nextStatus,
          approvedAt: nextStatus === "APPROVED" ? new Date() : null,
          nrcText: notes || "",
        },
      });

      return tx.user.update({
        where: { id: userId },
        data: {
          verificationStatus: nextStatus,
          isVerified: nextStatus === "APPROVED",
        },
        include: {
          ownerProfile: true,
        },
      });
    });

    return res.json({ data: serializeUser(updatedOwner) });
  } catch (error: any) {
    console.error("Verify owner error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:userId/owner-documents", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const ownerProfile = await prisma.ownerProfile.findUnique({
      where: { userId: req.params.userId },
    });

    return res.json({
      data: serializeOwnerDocuments(ownerProfile),
    });
  } catch (error: any) {
    console.error("Get admin owner documents error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/verifications/cars", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const cars = await prisma.car.findMany({
      where: { adminApprovalStatus: "PENDING" },
      include: { carImages: true, owner: { include: { ownerProfile: true } } },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ data: cars.map(serializeCar) });
  } catch (error: any) {
    console.error("Get pending car verifications error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/verifications/cars/history", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const cars = await prisma.car.findMany({
      where: { adminApprovalStatus: { in: ["APPROVED", "REJECTED"] } },
      include: { carImages: true, owner: { include: { ownerProfile: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({ data: cars.map(serializeCar) });
  } catch (error: any) {
    console.error("Get car verifications history error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verifications/cars/:carId", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const { status } = req.body;
    const nextStatus = status === "verified" || status === "approved" ? "APPROVED" : status === "rejected" ? "REJECTED" : null;

    if (!nextStatus) {
      return res.status(400).json({ error: "Status must be verified, approved, or rejected" });
    }

    const existing = await prisma.car.findUnique({
      where: { id: req.params.carId },
      include: { owner: { include: { ownerProfile: true } } },
    });

    if (!existing) {
      return res.status(404).json({ error: "Car not found" });
    }

    if (nextStatus === "APPROVED" && !isApprovedOwner(existing.owner)) {
      return res.status(400).json({ error: "Owner KYC must be approved before approving this car" });
    }

    const car = await prisma.car.update({
      where: { id: existing.id },
      data: {
        adminApprovalStatus: nextStatus,
        approvedAt: nextStatus === "APPROVED" ? new Date() : null,
      },
      include: { carImages: true, owner: { include: { ownerProfile: true } } },
    });

    return res.json({ data: serializeCar(car) });
  } catch (error: any) {
    console.error("Verify car error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const role = typeof req.query.role === "string" ? req.query.role.toUpperCase() : null;

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role: role as any } : {}),
      },
      include: {
        ownerProfile: true,
        driverProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ data: users.map(serializeUser) });
  } catch (error: any) {
    console.error("Get admin users error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users/:id
router.get("/users/:id", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        ownerProfile: true,
        driverProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ data: serializeUser(user) });
  } catch (error: any) {
    console.error("Get admin user detail error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/users/:id/suspend
router.post("/users/:id/suspend", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isActive: false,
      },
      include: {
        ownerProfile: true,
        driverProfile: true,
      },
    });

    return res.json({ data: serializeUser(user) });
  } catch (error: any) {
    console.error("Suspend user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/users/:id/unsuspend
router.post("/users/:id/unsuspend", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isActive: true,
      },
      include: {
        ownerProfile: true,
        driverProfile: true,
      },
    });

    return res.json({ data: serializeUser(user) });
  } catch (error: any) {
    console.error("Unsuspend user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    // 1. Get counts
    const totalUsers = await prisma.user.count();
    const totalOwners = await prisma.user.count({ where: { role: "OWNER" } });
    const totalDrivers = await prisma.user.count({ where: { role: "DRIVER" } });
    const totalCars = await prisma.car.count();
    
    const pendingOwners = await prisma.user.count({
      where: { role: "OWNER", verificationStatus: "PENDING" },
    });
    const pendingDrivers = await prisma.driverProfile.count({
      where: { kycStatus: "PENDING" },
    });
    const pendingCars = await prisma.car.count({
      where: { adminApprovalStatus: "PENDING" },
    });

    const activeBookings = await prisma.carRental.count({
      where: { status: "ACTIVE" },
    });

    // 2. Fetch total revenue (sum of confirmed payments)
    const [revResult] = await prisma.$queryRaw<Array<{ sum: any }>>`
      SELECT SUM(amount) as sum FROM booking_payments WHERE status = 'confirmed'
    ` || [{ sum: 0 }];
    const totalRevenue = Number(revResult?.sum || 0);

    // 3. Fetch pending payment approvals count
    const [pendingPayments] = await prisma.$queryRaw<Array<{ count: any }>>`
      SELECT COUNT(*) as count FROM booking_payments WHERE status = 'under_review'
    ` || [{ count: 0 }];
    const pendingPaymentApprovals = Number(pendingPayments?.count || 0);

    // 4. Fetch recent activities (e.g. notifications triggered by admins or recent verifications)
    const recentNotifications = await prisma.notification.findMany({
      where: {
        receiver: { role: { in: ["OWNER", "DRIVER"] } },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    const recentActivities = recentNotifications.map((n) => ({
      id: n.id,
      description: n.message,
      created_at: n.createdAt,
    }));

    // 5. Monthly revenue chart (last 6 months of confirmed payments)
    const monthlyRevenue = await prisma.$queryRaw<Array<{ month: string; amount: number }>>`
      SELECT 
        TO_CHAR(paid_at, 'Mon') as month,
        SUM(amount)::float as amount
      FROM booking_payments
      WHERE status = 'confirmed' AND paid_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(paid_at, 'Mon'), DATE_TRUNC('month', paid_at)
      ORDER BY DATE_TRUNC('month', paid_at) ASC
    ` || [];

    const stats = {
      total_users: totalUsers,
      total_owners: totalOwners,
      total_drivers: totalDrivers,
      total_cars: totalCars,
      pending_owner_verifications: pendingOwners,
      pending_driver_verifications: pendingDrivers,
      pending_car_verifications: pendingCars,
      active_bookings: activeBookings,
      active_disputes: 0,
      pending_payment_approvals: pendingPaymentApprovals,
      total_revenue: totalRevenue,
      recent_activities: recentActivities,
      revenue_chart: monthlyRevenue,
    };

    return res.json({ data: stats });
  } catch (error: any) {
    console.error("Get admin dashboard stats error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/audit-log
router.get("/audit-log", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    // Use recent notifications triggered by admins as audit log fallback
    const logs = await prisma.notification.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    });

    const data = logs.map((log) => ({
      id: log.id,
      description: log.message,
      created_at: log.createdAt,
    }));

    return res.json({ data });
  } catch (error: any) {
    console.error("Get audit log error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

