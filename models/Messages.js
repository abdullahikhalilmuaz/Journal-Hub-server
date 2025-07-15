const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CollaborationGroup",
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  fileUrl: { type: String }, // URL to the uploaded file (optional)
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);