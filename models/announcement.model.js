import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  text: { type: String, required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, 
}, {
    timestamps: true
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
