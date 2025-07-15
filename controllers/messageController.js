const fs = require("fs");
const path = require("path");

const message = (req, res) => {
  const { username, userEmail, messageContent } = req.body;
  const file = req.file ? `/uploads/${req.file.filename}` : null;

  fs.readFile("./database/messages.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to load data files" });
    }

    const existingMessages = JSON.parse(data || "[]");
    const newMessage = {
      username,
      userEmail,
      messageContent,
      file,
    };

    if (!username || !userEmail || !messageContent) {
      return res.status(400).json({ message: "Fill out the form first" });
    }

    existingMessages.push(newMessage);

    fs.writeFile(
      "./database/messages.json",
      JSON.stringify(existingMessages, null, 2),
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to send message" });
        }
        res
          .status(200)
          .json({ message: "Message sent successfully", newMessage });
      }
    );
  });
};

const getExistingMessages = (req, res) => {
  fs.readFile("./database/messages.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to load data files" });
    }
    res.status(200).json({ messages: JSON.parse(data || "[]") });
  });
};

module.exports = { message, getExistingMessages };
