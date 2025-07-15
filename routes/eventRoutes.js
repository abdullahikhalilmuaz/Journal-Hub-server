const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const EVENTS_FILE = path.join(__dirname, "..", "database", "events.json");

// Ensure the database directory exists
const DATA_DIR = path.join(__dirname, "..", "database");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper function to read events from the file
const readEvents = () => {
  if (!fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(EVENTS_FILE, "utf8");
  return JSON.parse(data);
};

// Helper function to write events to the file
const writeEvents = (events) => {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
};

// 📌 POST Endpoint: Create a new event (Only accessible to institutions)
router.post("/", (req, res) => {
  const { title, description, host, location, date, time, createdBy } = req.body;

  if (!title || !description || !host || !location || !date || !time || !createdBy) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const events = readEvents();

  const newEvent = {
    id: Date.now().toString(), // Generate a unique ID
    title,
    description,
    host,
    location,
    date,
    time,
    createdBy,
  };

  events.push(newEvent);
  writeEvents(events);

  res.status(201).json({ message: "Event created successfully", event: newEvent });
});

// 📌 GET Endpoint: Fetch all events
router.get("/", (req, res) => {
  const events = readEvents();
  res.status(200).json(events);
});

// 📌 GET Endpoint: Fetch events by institution
router.get("/institution/:institutionId", (req, res) => {
  const { institutionId } = req.params;
  const events = readEvents();

  const institutionEvents = events.filter(
    (event) => event.createdBy === institutionId
  );

  res.status(200).json(institutionEvents);
});

// 📌 DELETE Endpoint: Delete an event (Only accessible to the institution that created it)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const { createdBy } = req.body;

  if (!createdBy) {
    return res.status(400).json({ error: "Institution ID is required" });
  }

  const events = readEvents();
  const eventIndex = events.findIndex((event) => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).json({ error: "Event not found" });
  }

  if (events[eventIndex].createdBy !== createdBy) {
    return res.status(403).json({ error: "You are not authorized to delete this event" });
  }

  events.splice(eventIndex, 1);
  writeEvents(events);

  res.status(200).json({ message: "Event deleted successfully" });
});

module.exports = router;