const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/userModel.js");
const CollaborationGroup = require("../models/collaborationModel.js");

// ✅ Create Group Route
router.post("/create-group", async (req, res) => {
  try {
    let { name, members, createdBy } = req.body;

    if (!name || !members || !createdBy) {
      return res
        .status(400)
        .json({ error: "Group name, members, and creator are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    createdBy = new mongoose.Types.ObjectId(createdBy);

    const creator = await User.findById(createdBy);
    if (!creator) {
      return res.status(404).json({ error: "User not found" });
    }

    const validMembers = members.every((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    if (!validMembers) {
      return res.status(400).json({ error: "Invalid member ID(s) format" });
    }

    members = members.map((id) => new mongoose.Types.ObjectId(id));

    const group = await CollaborationGroup.create({ name, members, createdBy });

    for (const memberId of members) {
      const user = await User.findById(memberId);
      if (user) {
        user.notifications.push({
          message: `You have been added to the group: ${name}`,
          groupId: group._id,
        });
        await user.save();
      }
    }

    for (const memberId of members) {
      await User.findByIdAndUpdate(memberId, {
        $push: { groups: group._id },
      });
    }

    await User.findByIdAndUpdate(createdBy, {
      $push: { groups: group._id },
    });

    res.status(201).json({ message: "Group created successfully!", group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Fetch user ID by email
router.get("/get-user-id", async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ userId: user._id }); // Return the user ID
  } catch (error) {
    console.error("Error fetching user ID:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch notifications for a specific user
router.get("/notifications", async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "username email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/user-groups", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const groups = await CollaborationGroup.find({
      members: user._id,
    }).populate("members", "username email");

    res.json(groups);
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

router.get("/user-groups", async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ email }).populate("groups");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.groups); // Assuming `groups` is a field in your User model
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Send message to group
router.post("/send-message", async (req, res) => {
  try {
    const { groupId, senderId, content, fileUrl, imageUrl } = req.body;

    if (!groupId || !senderId) {
      return res
        .status(400)
        .json({ error: "Group ID and sender ID are required." });
    }

    const group = await CollaborationGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const newMessage = {
      sender: senderId,
      content,
      fileUrl,
      imageUrl,
    };

    group.messages.push(newMessage);
    await group.save();

    res.status(201).json({ message: "Message sent successfully!", newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Fetch messages for a group
router.get("/messages/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await CollaborationGroup.findById(groupId)
      .populate("messages.sender", "username email")
      .populate("members", "username email");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(group.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
