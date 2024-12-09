import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    coverImage: {
      type: String, 
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
    
    organizer: {
      type: String,
      required: true,
    }, 
      attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
