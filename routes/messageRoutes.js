const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  message,
  getExistingMessages,
} = require("../controllers/messageController");

const messageRoute = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

messageRoute.post("/alluser/message", upload.single("file"), message);
messageRoute.get("/alluser/message", getExistingMessages);

module.exports = messageRoute;
