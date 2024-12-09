import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  getAllEvents,
  addAttendee,
  createEvent,
  getEventById,
} from "../controllers/event.controller.js";
import cron from "node-cron";
import moment from "moment";
import Event from "../models/event.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const router = express.Router();

router.get("/", protectedRoute, getAllEvents);
router.post("/", protectedRoute, createEvent);
router.get("/:id", protectedRoute, getEventById);
router.post("/add-attendee", protectedRoute, addAttendee);

// Function to check if any event is tomorrow and send an announcement
const checkAndSendAnnouncements = async () => {
  try {
    const tomorrow = moment().add(1, "days").startOf("day").toDate(); // Start of tomorrow
    const tomorrowEnd = moment(tomorrow).endOf("day").toDate(); // End of tomorrow

    const eventsTomorrow = await Event.find({
      eventDate: { $gte: tomorrow, $lte: tomorrowEnd },
    });

    console.log(eventsTomorrow.length + " events tomorrow")

    for (let event of eventsTomorrow) {
        const text = `Event "${event.title}" is happening tomorrow!`;
      const existingAnnouncement = await Notification.findOne({
        text,
        type: "announcement",
      });

      if (!existingAnnouncement && !event.notified) {
        const users = await User.find();
        users.forEach(async (user) => {
          const notification = new Notification({
            to: user._id,
            text,
            type: "announcement",
          });
          await notification.save();
        });

        event.notified = true; 
        await event.save();
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
};

// Schedule the cron job to run every minute
checkAndSendAnnouncements(); 
cron.schedule("* * * * *", checkAndSendAnnouncements);

export default router;
