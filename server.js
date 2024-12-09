import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "./db/connectDB.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";
import postRoutes from "./routes/post.routes.js";
import searchRoutes from "./routes/search.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import eventRoutes from "./routes/event.routes.js";
import cors from "cors";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000']; // Add your frontend URL(s) here

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header (e.g., Postman or testing)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request from the frontend
    } else {
      callback(new Error('Not allowed by CORS')); // Reject others
    }
  },
  credentials: true,  // Enable cookies (JWT) to be sent in cross-origin requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
};

// Use CORS with the configuration
app.use(cors(corsOptions));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser()); // get cookies from request

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/events", eventRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
