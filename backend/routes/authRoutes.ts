import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../src/lib/auth.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  loginSchema,
  registerRequestSchema,
  registerVerifySchema,
  getEmailByPhoneSchema,
} from "../src/lib/validation-schemas.js";
import {
  getEmailByPhoneController,
  login,
  logout,
  refresh,
  registerRequest,
  registerVerify,
  session,
} from "../controller/authController.js";

const router = Router();

router.post("/register-request", validate(registerRequestSchema), registerRequest);
router.post("/register-verify", validate(registerVerifySchema), registerVerify);
router.get("/get-email-by-phone", getEmailByPhoneController);

router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", logout);
router.get("/auth/session", authMiddleware, session);

router.all("/auth/*splat", toNodeHandler(auth));

export default router;
