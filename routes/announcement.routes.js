import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import {getAnnouncements, createAnnouncement} from '../controllers/announcement.controller.js';
const router = express.Router();

router.get("/", protectedRoute, getAnnouncements);
router.post("/create", protectedRoute, createAnnouncement);


export default router;