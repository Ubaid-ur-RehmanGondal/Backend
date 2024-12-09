import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import {search } from '../controllers/search.controller.js';
const router = express.Router();

router.get("/", protectedRoute, search);


export default router;