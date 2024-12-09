import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            default: ""
        },
        type: {
            type: String,
            required: true,
            enum: ["follow", "like", "bookmark", "announcement"],
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;