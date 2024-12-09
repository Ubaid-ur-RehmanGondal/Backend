import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import {sendEmailMessage, deletePost, deleteUser } from '../controllers/admin.controller.js';
const router = express.Router();

router.post("/send-email", protectedRoute, sendEmailMessage);
router.post("/delete-user", protectedRoute, deleteUser);
router.post("/delete-post", protectedRoute, deletePost);


export default router;