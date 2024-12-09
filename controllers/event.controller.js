import Event from '../models/event.model.js';
import { v2 as cloudinary } from "cloudinary";

// Controller function to fetch all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({createdAt: -1}).populate("attendees").exec();
    if (!events) {
      return res.status(404).json({ message: 'No events found' });
    }
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: 'Something went wrong while fetching events' });
  }
};

// Controller function to fetch a single event by its ID
export const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: 'Something went wrong while fetching the event' });
  }
};


export const createEvent = async (req, res) => {
  const { title, description, eventDate, location, organizer } = req.body;
  let {coverImage} = req.body; 

  if (!title || !description || !eventDate || !coverImage || !location || !organizer) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

    if (coverImage) {
      const uploadedResponse = await cloudinary.uploader.upload(coverImage);
      coverImage = uploadedResponse.secure_url;
    }

  try {
    const newEvent = new Event({
      title,
      description,
      eventDate,
      coverImage,
      location,
      organizer
    });

    await newEvent.save();

    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Something went wrong while creating the event' });
  }
};

export const addAttendee = async (req, res) => {
  const { eventId, userId } = req.body; 

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: "User is already an attendee." });
    }

    event.attendees.push(userId);

    await event.save();

    res.status(200).json({ message: "User successfully added to attendees list.", event });
  } catch (error) {
    console.error("Error adding attendee: ", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};