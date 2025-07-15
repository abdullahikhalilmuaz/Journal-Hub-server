const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();
const NEWS_FILE = path.join(__dirname, "..", "database", "news&&update.json");

// Ensure the database directory exists
const DATA_DIR = path.join(__dirname, "..", "database");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "public", "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// 📌 POST Endpoint: Add a News Post
router.post("/", upload.single("image"), (req, res) => {
  console.log("📩 Incoming request:", req.body);
  console.log("📸 Uploaded file:", req.file);

  try {
    const { email, body } = req.body;
    if (!email || !body) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPost = {
      user: { email },
      date: new Date().toISOString(),
      image: req.file
        ? `http://localhost:5000/public/uploads/${req.file.filename}`
        : null,
      body,
      likes: [],
      comments: [],
    };

    // Read existing data
    fs.readFile(NEWS_FILE, "utf8", (err, data) => {
      let newsData = [];
      if (!err && data) {
        try {
          newsData = JSON.parse(data);
        } catch (parseError) {
          console.error("❌ JSON Parse Error:", parseError);
        }
      }

      newsData.push(newPost);

      // Write data asynchronously
      fs.writeFile(NEWS_FILE, JSON.stringify(newsData, null, 2), (writeErr) => {
        if (writeErr) {
          console.error("❌ Error writing file:", writeErr);
          return res.status(500).json({ error: "Failed to save news post" });
        }
        console.log("✅ News post saved successfully!");
        res.status(201).json({ message: "News post added", post: newPost });
      });
    });
  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 📌 GET Endpoint: Fetch News
router.get("/", (req, res) => {
  fs.readFile(NEWS_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("❌ Error reading file:", err);
      return res.status(500).json({ error: "Failed to fetch news" });
    }
    try {
      const newsData = JSON.parse(data);
      return res.json(newsData);
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      return res.status(500).json({ error: "Invalid JSON data" });
    }
  });
});

// 📌 PUT Endpoint: Toggle Like on a News Post
router.put("/:id/like", (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body; // Assume the frontend sends the userId in the request body

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  fs.readFile(NEWS_FILE, "utf8", (err, data) => {
    if (err) {
      console.error("❌ Error reading file:", err);
      return res.status(500).json({ error: "Failed to fetch news" });
    }

    try {
      const newsData = JSON.parse(data);

      // Find the post by ID
      const post = newsData.find((post, index) => index === parseInt(postId));
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Check if the user has already liked the post
      const userLikeIndex = post.likes.findIndex(
        (like) => like.userId === userId
      );

      if (userLikeIndex === -1) {
        // User hasn't liked the post yet, add their like
        post.likes.push({ userId });
      } else {
        // User has already liked the post, remove their like
        post.likes.splice(userLikeIndex, 1);
      }

      // Write the updated data back to the file
      fs.writeFile(NEWS_FILE, JSON.stringify(newsData, null, 2), (writeErr) => {
        if (writeErr) {
          console.error("❌ Error writing file:", writeErr);
          return res.status(500).json({ error: "Failed to update likes" });
        }

        console.log("✅ Like toggled successfully!");
        res
          .status(200)
          .json({ message: "Like toggled", likes: post.likes.length });
      });
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      return res.status(500).json({ error: "Invalid JSON data" });
    }
  });
});

// 📌 POST Endpoint: Add a Comment to a News Post
router.post("/:id/comment", (req, res) => {
  const postId = req.params.id;
  const { email, username, comment } = req.body;

  if (!email || !username || !comment) {
    return res.status(400).json({ error: "All fields are required" });
  }

  fs.readFile("./database/news&&update.json", "utf8", (err, data) => {
    if (err) {
      console.error("❌ Error reading file:", err);
      return res.status(500).json({ error: "Failed to fetch news" });
    }

    try {
      let newsData = JSON.parse(data);
      const postIndex = newsData.findIndex(
        (post, index) => index === parseInt(postId)
      );

      if (postIndex === -1) {
        return res.status(404).json({ error: "Post not found" });
      }

      const newComment = {
        user: { email, username },
        comment,
        date: new Date().toISOString(),
      };

      newsData[postIndex].comments.push(newComment);

      fs.writeFile(NEWS_FILE, JSON.stringify(newsData, null, 2), (writeErr) => {
        if (writeErr) {
          console.error("❌ Error writing file:", writeErr);
          return res.status(500).json({ error: "Failed to save comment" });
        }
        console.log("✅ Comment added successfully!");
        res.status(201).json({ message: "Comment added", comment: newComment });
      });
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      return res.status(500).json({ error: "Invalid JSON data" });
    }
  });
});

module.exports = router;
