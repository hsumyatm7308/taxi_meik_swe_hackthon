import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";
import prisma from "./prisma.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    fields: {
      phoneNumber: "phone",
      image: "profilePhoto",
    },
    additionalFields: {
      role: { type: "string" },
      nrcNumber: { type: "string", required: false },
      city: { type: "string", required: false },
      township: { type: "string", required: false },
      address: { type: "string", required: false },
      phoneNumberVerified: { type: "boolean", required: false },
    },
  },
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, request) => {
        console.log(`\n--- SMS OTP SENT ---`);
        console.log(`Phone: ${phoneNumber}`);
        console.log(`Code: ${code}`);
        console.log(`--------------------\n`);
      },
    }),
  ],
  trustedOrigins: ["http://localhost:3000", "http://localhost:5173"],
});
