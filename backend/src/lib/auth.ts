import { betterAuth } from "better-auth";
import { phoneNumber } from "better-auth/plugins";
import { baseAuthOptions } from "./auth-config.js";

export const auth = betterAuth({
  ...baseAuthOptions,
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber: phone, code }, request) => {
        console.log(`\n--- SMS OTP SENT ---`);
        console.log(`Phone: ${phone}`);
        console.log(`Code: ${code}`);
        console.log(`--------------------\n`);
      },
    }),
  ],
});
