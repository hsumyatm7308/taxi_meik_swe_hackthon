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

router.post("/verifications/owners/:userId", async (req, res) => {
  try {
    const admin = await requireUser(req, res, ["ADMIN"]);
    if (!admin) return;

    const { userId } = req.params;
    const { status } = req.body;
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

export default router;
