// import { createAuthClient } from "better-auth/react";
// import { phoneNumberClient } from "better-auth/client/plugins";

// export const authClient = createAuthClient({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
//   plugins: [
//     phoneNumberClient(),
//   ],
// });

export const authClient = {
  signIn: { email: async () => ({ error: new Error('Auth disabled') }) },
  signOut: async () => {},
  getSession: async () => null,
}
