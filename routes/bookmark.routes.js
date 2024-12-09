import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import {getBookmarks,createBookmark } from '../controllers/bookmark.controller.js';
const router = express.Router();

router.get("/:id", protectedRoute, getBookmarks);
router.post("/create", protectedRoute, createBookmark);


export default router;