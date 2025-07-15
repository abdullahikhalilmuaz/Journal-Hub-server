const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createJournal,
  getAllJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
  getJournalsByCategory,
  getJournalsByInstitution,
  rateJournal,
  getJournalRatings,
  incrementViews,
  incrementDownloads,
  getJournalMetrics,
} = require("../controllers/journalController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/journals/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only PDF and DOCX files are allowed"));
  },
});

// Journal routes
router.post("/", upload.single("file"), createJournal);
router.get("/", getAllJournals);
router.get("/:id", getJournalById);
router.put("/:id", updateJournal);
router.delete("/:id", deleteJournal);
router.get("/category/:category", getJournalsByCategory);
router.get("/institution/:institution", getJournalsByInstitution);
router.post("/:id/rate", rateJournal);
router.get("/:id/ratings", getJournalRatings);
router.post("/:id/views", incrementViews);
router.post("/:id/downloads", incrementDownloads);
router.get("/:id/metrics", getJournalMetrics);

module.exports = router;
