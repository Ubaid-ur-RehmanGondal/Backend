import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { getUserProfile, getAllUsers, updatePassword, forgotPassword, reportPost, getSuggestedUsers, followUnfollowUser, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, getSuggestedUsers);
router.get("/all", protectedRoute, getAllUsers);
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.post("/update", protectedRoute, updateUser);
router.post("/report", protectedRoute, reportPost);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", updatePassword);





export default router;