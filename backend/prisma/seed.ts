import crypto from "crypto";
import prisma from "../src/lib/prisma.js";
import { auth } from "../src/lib/auth.js";

const PASSWORD = "Password123!";
const now = new Date();
const approvedAt = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const seedCarImageSets = [
  {
    front: "/uploads/kyc/1780046362055-bji6c_car.jpg",
    back: "/uploads/kyc/1780046362056-ftmi56_car.jpg",
    left: "/uploads/kyc/1780046362055-jotvhp_car.jpg",
    right: "/uploads/kyc/1780046362056-e6py3g_banner_img.jpg",
  },
  {
    front: "/uploads/kyc/1780028805462-iin2jl_car.jpg",
    back: "/uploads/kyc/1780028805462-c6yjo_car.jpg",
    left: "/uploads/kyc/1780028805461-2vdhqf_banner_img.jpg",
    right: "/uploads/kyc/1780028805457-r97vt_Screenshot_2026_05_27_at_9.00.53___PM.png",
  },
  {
    front: "/uploads/kyc/1780063123176-5x4wyi_car.jpg",
    back: "/uploads/kyc/1780063123176-ba1rcs_car.jpg",
    left: "/uploads/kyc/1780063123179-znqu5l_banner_img.jpg",
    right: "/uploads/kyc/1780063123177-gmdl5_banner_img.jpg",
  },
];

type SeedUser = {
  email: string;
  phone: string;
  name: string;
  role: "OWNER" | "DRIVER" | "ADMIN";
  city: string;
  township: string;
  address: string;
  nrcNumber: string;
};

async function upsertAuthUser(data: SeedUser) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  let userId = existing?.id;

  if (!userId) {
    const signedUp = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: PASSWORD,
        name: data.name,
        role: data.role,
      },
    });

    if (!signedUp?.user?.id) {
      throw new Error(`Failed to create ${data.email}`);
    }

    userId = signedUp.user.id;
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      phone: data.phone,
      name: data.name,
      role: data.role,
      city: data.city,
      township: data.township,
      address: data.address,
      nrcNumber: data.nrcNumber,
      isVerified: true,
      verificationStatus: "APPROVED",
      phoneNumberVerified: true,
      emailVerified: true,
      isActive: true,
    },
  });
}

async function upsertOwnerProfile(userId: string, nrcText: string) {
  return prisma.ownerProfile.upsert({
    where: { userId },
    update: {
      address: "Seed owner address",
      nrcText,
      nrcFrontImage: "/uploads/kyc/seed-owner-nrc-front.jpg",
      nrcBackImage: "/uploads/kyc/seed-owner-nrc-back.jpg",
      adminApprovalStatus: "APPROVED",
      approvedAt,
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      address: "Seed owner address",
      nrcText,
      nrcFrontImage: "/uploads/kyc/seed-owner-nrc-front.jpg",
      nrcBackImage: "/uploads/kyc/seed-owner-nrc-back.jpg",
      adminApprovalStatus: "APPROVED",
      approvedAt,
    },
  });
}

async function upsertDriverProfile(userId: string, nrcText: string) {
  return prisma.driverProfile.upsert({
    where: { userId },
    update: {
      address: "Seed driver address",
      nrcText,
      nrcFrontImage: "/uploads/kyc/seed-driver-nrc-front.jpg",
      nrcBackImage: "/uploads/kyc/seed-driver-nrc-back.jpg",
      driverLicenseImage: "/uploads/kyc/seed-driver-license.jpg",
      nrcFrontUrl: "/uploads/kyc/seed-driver-nrc-front.jpg",
      nrcBackUrl: "/uploads/kyc/seed-driver-nrc-back.jpg",
      selfieUrl: "/uploads/kyc/seed-driver-selfie.jpg",
      drivingLicenseUrl: "/uploads/kyc/seed-driver-license.jpg",
      drivingLicenseFrontUrl: "/uploads/kyc/seed-driver-license-front.jpg",
      drivingLicenseBackUrl: "/uploads/kyc/seed-driver-license-back.jpg",
      kycStatus: "APPROVED",
      adminApprovalStatus: "APPROVED",
      approvedAt,
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      address: "Seed driver address",
      nrcText,
      nrcFrontImage: "/uploads/kyc/seed-driver-nrc-front.jpg",
      nrcBackImage: "/uploads/kyc/seed-driver-nrc-back.jpg",
      driverLicenseImage: "/uploads/kyc/seed-driver-license.jpg",
      nrcFrontUrl: "/uploads/kyc/seed-driver-nrc-front.jpg",
      nrcBackUrl: "/uploads/kyc/seed-driver-nrc-back.jpg",
      selfieUrl: "/uploads/kyc/seed-driver-selfie.jpg",
      drivingLicenseUrl: "/uploads/kyc/seed-driver-license.jpg",
      drivingLicenseFrontUrl: "/uploads/kyc/seed-driver-license-front.jpg",
      drivingLicenseBackUrl: "/uploads/kyc/seed-driver-license-back.jpg",
      kycStatus: "APPROVED",
      adminApprovalStatus: "APPROVED",
      approvedAt,
    },
  });
}

async function upsertDriverLicense(userId: string, licenseNumber: string, yearsExperience: number) {
  return prisma.driverLicense.upsert({
    where: { userId },
    update: {
      licenseNumber,
      licenseClass: "B",
      expiryDate: new Date("2030-12-31"),
      documentUrl: "/uploads/kyc/seed-driver-license.jpg",
      yearsExperience,
      status: "APPROVED",
      verifiedAt: approvedAt,
    },
    create: {
      id: crypto.randomUUID(),
      userId,
      licenseNumber,
      licenseClass: "B",
      expiryDate: new Date("2030-12-31"),
      documentUrl: "/uploads/kyc/seed-driver-license.jpg",
      yearsExperience,
      status: "APPROVED",
      verifiedAt: approvedAt,
    },
  });
}

async function upsertCar(params: {
  ownerId: string;
  licenseNumber: string;
  brand: string;
  model: string;
  color: string;
  price: string;
}) {
  const imageSet =
    seedCarImageSets[
      params.licenseNumber.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        seedCarImageSets.length
    ]!;

  const car = await prisma.car.upsert({
    where: { licenseNumber: params.licenseNumber },
    update: {
      ownerId: params.ownerId,
      brand: params.brand,
      model: params.model,
      color: params.color,
      rating: 4.7,
      year: 2021,
      fuelType: "PETROL",
      ownerBook: "/uploads/kyc/seed-owner-book.jpg",
      rentalPeriod: "Daily",
      rentalPaymentType: "DAILY",
      rentalType: "OWNER_HOME",
      rentalPrice: params.price,
      depositAmount: "250000",
      availabilityStatus: "AVAILABLE",
      adminApprovalStatus: "APPROVED",
      approvedAt,
    },
    create: {
      id: crypto.randomUUID(),
      ownerId: params.ownerId,
      brand: params.brand,
      model: params.model,
      color: params.color,
      rating: 4.7,
      year: 2021,
      licenseNumber: params.licenseNumber,
      fuelType: "PETROL",
      ownerBook: "/uploads/kyc/seed-owner-book.jpg",
      rentalPeriod: "Daily",
      rentalPaymentType: "DAILY",
      rentalType: "OWNER_HOME",
      rentalPrice: params.price,
      depositAmount: "250000",
      availabilityStatus: "AVAILABLE",
      adminApprovalStatus: "APPROVED",
      approvedAt,
    },
  });

  await prisma.carImage.upsert({
    where: { carId: car.id },
    update: {
      frontImage: imageSet.front,
      backImage: imageSet.back,
      leftImage: imageSet.left,
      rightImage: imageSet.right,
    },
    create: {
      id: crypto.randomUUID(),
      carId: car.id,
      frontImage: imageSet.front,
      backImage: imageSet.back,
      leftImage: imageSet.left,
      rightImage: imageSet.right,
    },
  });

  return car;
}

async function upsertApplication(ownerId: string, carId: string, driverId: string, approved = false) {
  return prisma.carApplication.upsert({
    where: { carId_driverId: { carId, driverId } },
    update: {
      ownerId,
      ownerApprovalStatus: approved ? "APPROVED" : "PENDING",
      adminApprovalStatus: approved ? "APPROVED" : "PENDING",
      approvedAt: approved ? approvedAt : null,
      wardRecommendationLetter: "/uploads/kyc/seed-ward-recommendation.pdf",
    },
    create: {
      id: crypto.randomUUID(),
      ownerId,
      carId,
      driverId,
      ownerApprovalStatus: approved ? "APPROVED" : "PENDING",
      adminApprovalStatus: approved ? "APPROVED" : "PENDING",
      approvedAt: approved ? approvedAt : null,
      wardRecommendationLetter: "/uploads/kyc/seed-ward-recommendation.pdf",
    },
  });
}

async function createHistoricalReview(params: {
  ownerId: string;
  driverId: string;
  index: number;
  rating: number;
  carPrefix: string;
}) {
  const car = await upsertCar({
    ownerId: params.ownerId,
    licenseNumber: `${params.carPrefix}-${String(params.index).padStart(3, "0")}`,
    brand: "Toyota",
    model: "Probox",
    color: params.index % 2 === 0 ? "White" : "Silver",
    price: "45000",
  });

  const application = await upsertApplication(params.ownerId, car.id, params.driverId, true);

  const rental = await prisma.carRental.upsert({
    where: { carApplicationId: application.id },
    update: {
      carId: car.id,
      ownerId: params.ownerId,
      driverId: params.driverId,
      rentalStartDate: new Date("2026-01-01"),
      rentalEndDate: new Date("2026-01-07"),
      status: "COMPLETED",
    },
    create: {
      id: crypto.randomUUID(),
      carApplicationId: application.id,
      carId: car.id,
      ownerId: params.ownerId,
      driverId: params.driverId,
      rentalStartDate: new Date("2026-01-01"),
      rentalEndDate: new Date("2026-01-07"),
      status: "COMPLETED",
    },
  });

  await prisma.review.upsert({
    where: {
      carRentalId_direction: {
        carRentalId: rental.id,
        direction: "OWNER_TO_DRIVER",
      },
    },
    update: {
      reviewerId: params.ownerId,
      targetUserId: params.driverId,
      carId: car.id,
      rating: params.rating,
      comment: "Reliable driver with professional communication.",
    },
    create: {
      id: crypto.randomUUID(),
      carRentalId: rental.id,
      reviewerId: params.ownerId,
      targetUserId: params.driverId,
      carId: car.id,
      direction: "OWNER_TO_DRIVER",
      rating: params.rating,
      comment: "Reliable driver with professional communication.",
    },
  });
}

async function main() {
  const owner = await upsertAuthUser({
    email: "owner.seed@taximeikswe.test",
    phone: "09990000001",
    name: "Owner Daw Su Mon",
    role: "OWNER",
    city: "Yangon",
    township: "Kamayut",
    address: "Kamayut, Yangon",
    nrcNumber: "12/KAMAYA(N)000001",
  });

  const exactTownshipDriver = await upsertAuthUser({
    email: "driver.kamayut@taximeikswe.test",
    phone: "09990000002",
    name: "Driver Ko Min Thu",
    role: "DRIVER",
    city: "Yangon",
    township: "Kamayut",
    address: "Kamayut, Yangon",
    nrcNumber: "12/KAMAYA(N)000002",
  });

  const higherRatingDriver = await upsertAuthUser({
    email: "driver.sanchaung@taximeikswe.test",
    phone: "09990000003",
    name: "Driver Ma Hnin Wai",
    role: "DRIVER",
    city: "Yangon",
    township: "Sanchaung",
    address: "Sanchaung, Yangon",
    nrcNumber: "12/SACHANA(N)000003",
  });

  await upsertOwnerProfile(owner.id, "12/KAMAYA(N)000001");
  await upsertDriverProfile(exactTownshipDriver.id, "12/KAMAYA(N)000002");
  await upsertDriverProfile(higherRatingDriver.id, "12/SACHANA(N)000003");
  await upsertDriverLicense(exactTownshipDriver.id, "SEED-DL-KAMAYUT-001", 6);
  await upsertDriverLicense(higherRatingDriver.id, "SEED-DL-SANCHAUNG-001", 4);

  const aiMatchCar = await upsertCar({
    ownerId: owner.id,
    licenseNumber: "SEED-AI-MATCH-001",
    brand: "Toyota",
    model: "Crown Taxi",
    color: "Pearl White",
    price: "65000",
  });

  await upsertApplication(owner.id, aiMatchCar.id, exactTownshipDriver.id);
  await upsertApplication(owner.id, aiMatchCar.id, higherRatingDriver.id);

  const exactRatings = [5, 5, 5, 5, 4];
  const higherRatings = [5, 5, 5, 5, 5, 5, 5, 5, 5, 4];

  for (const [index, rating] of exactRatings.entries()) {
    await createHistoricalReview({
      ownerId: owner.id,
      driverId: exactTownshipDriver.id,
      index: index + 1,
      rating,
      carPrefix: "SEED-KAMAYUT-HISTORY",
    });
  }

  for (const [index, rating] of higherRatings.entries()) {
    await createHistoricalReview({
      ownerId: owner.id,
      driverId: higherRatingDriver.id,
      index: index + 1,
      rating,
      carPrefix: "SEED-SANCHAUNG-HISTORY",
    });
  }

  await prisma.notification.create({
    data: {
      id: crypto.randomUUID(),
      receiverId: owner.id,
      triggerUserId: exactTownshipDriver.id,
      title: "Seed booking request",
      message: `${exactTownshipDriver.name} applied for ${aiMatchCar.brand} ${aiMatchCar.model}.`,
      type: "booking_request",
      entityId: aiMatchCar.id,
    },
  });

  console.log("Seed completed.");
  console.log(`Owner login: ${owner.email} / ${PASSWORD}`);
  console.log(`Driver login: ${exactTownshipDriver.email} / ${PASSWORD}`);
  console.log(`AI match test carId: ${aiMatchCar.id}`);
  console.log(`AI match ownerTownship: ${owner.township}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
