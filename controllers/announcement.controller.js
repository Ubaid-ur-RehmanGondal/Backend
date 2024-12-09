import Announcement from "../models/announcement.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const createAnnouncement = async (req, res) => {
  try {
    const { text, to} = req.body;

    // Create a new announcement
    const announcement = new Announcement({
      text,
      to: to ? to : null, // Null for everyone
    });

    // Save the announcement
    await announcement.save();

    // If the announcement is for everyone, create notifications for all users
    if (!to) {
      const users = await User.find();
      users.forEach(async (user) => {
        // Create a notification document for each user
        const notification = new Notification({
          to: user._id,
          text,
          type: "announcement",
        });

        console.log(notification)
        // Here you would save to a "notifications" collection
        await notification.save();
      });
    } else {
      // Create a notification for the specific user
      const notification = new Notification({
          to,
          text,
          type: "announcement",
        });
      await notification.save();
    }

    res.status(200).json(announcement);
  } catch (error) {
    console.log("Error creating announcement", error);
    res.status(500).json({ message: "Error creating announcement" });
  }
};

// Get all Announcements API
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("to", "username profilePicture")
      .sort({ createdAt: -1 }); // Most recent first
    res.status(200).json(announcements);
  } catch (error) {
    console.log("Error fetching announcements", error);
    res.status(500).json({ message: "Error fetching announcements" });
  }
};
