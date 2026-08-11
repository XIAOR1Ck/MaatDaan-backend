import { Router } from "express";

import {
  findVerifiedUser,
  findUnverifiedUser,
  sendVerificationEmail,
} from "../controllers/admin.controller";

import { protect, authorize } from "../middleware/auth";

const router = Router();

// All user routes below require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

router.get("/users/verified", findVerifiedUser);

router.get("/users/unverified", findUnverifiedUser);
router.get("/verification/:userId", sendVerificationEmail);

export default router;
