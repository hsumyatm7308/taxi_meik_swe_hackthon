import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import prisma from './lib/prisma.js';
import crypto from 'crypto';

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

// ─── Temporary in-memory store for pending registrations ──────────────────────
interface PendingRegistration {
  data: any;
  expiresAt: number;
}
const pendingRegistrations = new Map<string, PendingRegistration>();

// Cleanup expired registrations every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, value] of pendingRegistrations.entries()) {
    if (value.expiresAt < now) pendingRegistrations.delete(token);
  }
}, 5 * 60 * 1000);

// ─── STEP 1: Submit Registration Form & Send OTP ──────────────────────────────
// IMPORTANT: Must be registered BEFORE Better Auth's catch-all handler
app.post("/api/register-request", async (req, res) => {
  try {
    const data = req.body;
    const { email, phone, password, name, role } = data;

    if (!email || !phone || !password || !name || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ error: "Phone number is already registered" });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store registration data temporarily (10 min expiry)
    const tempToken = crypto.randomUUID();
    pendingRegistrations.set(tempToken, {
      data,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Upsert OTP into Verification table (5 min expiry)
    await prisma.verification.deleteMany({ where: { identifier: phone } });
    await prisma.verification.create({
      data: {
        id: crypto.randomUUID(),
        identifier: phone,
        value: otpCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Log to console (replace with real SMS in production)
    console.log("OTP Code:", otpCode);
    console.log(`\n╔═══════════════════════════╗`);
    console.log(`║    REGISTER OTP SENT      ║`);
    console.log(`╠═══════════════════════════╣`);
    console.log(`║ Phone: ${phone.padEnd(18)}║`);
    console.log(`║ Code:  ${otpCode.padEnd(18)}║`);
    console.log(`╚═══════════════════════════╝\n`);

    return res.json({ success: true, message: "OTP sent successfully", tempToken, code: otpCode });

  } catch (error: any) {
    console.error("Register request error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── STEP 2: Verify OTP & Create Account ──────────────────────────────────────
// IMPORTANT: Must be registered BEFORE Better Auth's catch-all handler
app.post("/api/register-verify", async (req, res) => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({ error: "Missing verification parameters" });
    }

    const registration = pendingRegistrations.get(tempToken);
    if (!registration || registration.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Registration session expired or invalid" });
    }

    const regData = registration.data;

    // Validate OTP against the Verification table
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: regData.phone,
        value: code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      return res.status(400).json({ error: "Invalid or expired OTP code" });
    }

    // Clean up
    await prisma.verification.delete({ where: { id: verification.id } });
    pendingRegistrations.delete(tempToken);

    // Create user via Better Auth (handles password hashing)
    const newUser = await auth.api.signUpEmail({
      body: {
        email: regData.email,
        password: regData.password,
        name: regData.name,
        role: regData.role,
      },
    });

    if (!newUser?.user) {
      return res.status(500).json({ error: "Failed to create user account" });
    }

    // Patch user with custom fields
    const updatedUser = await prisma.user.update({
      where: { id: newUser.user.id },
      data: {
        phone: regData.phone,
        role: regData.role,
        nrcNumber: regData.nrc_number || null,
        city: regData.city || null,
        township: regData.township || null,
        address: regData.address || null,
        phoneNumberVerified: true,
        isVerified: false,
        verificationStatus: "PENDING",
      },
    });

    // If driver, create DriverLicense record
    if (regData.role === "DRIVER" && regData.license_number) {
      await prisma.driverLicense.create({
        data: {
          id: crypto.randomUUID(),
          userId: updatedUser.id,
          licenseNumber: regData.license_number,
          licenseClass: "B",
          expiryDate: new Date(
            regData.license_expiry || Date.now() + 5 * 365 * 24 * 60 * 60 * 1000
          ),
          documentUrl: regData.nrc_document_url || "",
          yearsExperience: regData.years_experience || 0,
          status: "PENDING",
        },
      });
    }

    return res.json({ success: true, message: "Registration completed successfully" });

  } catch (error: any) {
    console.error("Register verification error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Get email by phone number (used to sign in via Better Auth using phone input)
app.get("/api/get-email-by-phone", async (req, res) => {
  try {
    const phone = req.query.phone;
    if (!phone || typeof phone !== "string") {
      return res.status(400).json({ error: "Phone number is required" });
    }
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { email: true }
    });
    if (!user) {
      return res.status(404).json({ error: "No account found with this phone number" });
    }
    return res.json({ email: user.email });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Better Auth Route Handler (catch-all — must come LAST) ───────────────────
app.all("/api/auth/*splat", toNodeHandler(auth));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
