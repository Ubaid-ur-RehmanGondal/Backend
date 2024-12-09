import express from "express";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

// auth routes 
router.get("/me", protectedRoute, me );
router.post("/login", login );
router.post("/register", register );
router.post("/logout", logout);


export default router;