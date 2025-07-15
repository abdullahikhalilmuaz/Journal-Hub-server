const Journal = require("../models/journalModel");
const Institution = require("../models/instituteModel");
const mongoose = require("mongoose");


// Get all journals
const getAllJournals = async (req, res) => {
  try {
    const journals = await Journal.find().sort({ createdAt: -1 }); // Sort by most recent
    res.status(200).json(journals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a specific journal by ID
const getJournalById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Journal not found" });
  }
  const journal = await Journal.findById(id);
  if (!journal) {
    return res.status(404).json({ error: "Journal not found" });
  }
  res.status(200).json(journal);
};

// Update a journal by ID
const updateJournal = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Journal not found" });
  }
  const journal = await Journal.findByIdAndUpdate(id, req.body, { new: true });
  if (!journal) {
    return res.status(404).json({ error: "Journal not found" });
  }
  res.status(200).json(journal);
};

// Delete a journal by ID
const deleteJournal = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Journal not found" });
  }
  const journal = await Journal.findByIdAndDelete(id);
  if (!journal) {
    return res.status(404).json({ error: "Journal not found" });
  }
  res.status(200).json({ message: "Journal deleted successfully" });
};

// Get journals by category
const getJournalsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const journals = await Journal.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(journals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get journals by institution
const getJournalsByInstitution = async (req, res) => {
  const { institution } = req.params;
  try {
    const journals = await Journal.find({ institution }).sort({
      createdAt: -1,
    });
    res.status(200).json(journals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Rate a journal and submit a review
const rateJournal = async (req, res) => {
  const { id } = req.params;
  const { rating, comment, user } = req.body; // Include comment and user

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  try {
    const journal = await Journal.findById(id);
    if (!journal) {
      return res.status(404).json({ error: "Journal not found." });
    }

    // Add the rating to the journal
    journal.ratings.push(rating);

    // Add the review to the journal
    if (comment && user) {
      journal.reviews.push({ user, comment });
    }

    await journal.save();

    res
      .status(200)
      .json({ message: "Rating and review submitted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to submit rating and review.",
        details: error.message,
      });
  }
};

// Get ratings for a specific journal
const getJournalRatings = async (req, res) => {
  const { id } = req.params;

  try {
    const journal = await Journal.findById(id);
    if (!journal) {
      return res.status(404).json({ error: "Journal not found." });
    }

    // Return the ratings array
    res.status(200).json({ ratings: journal.ratings });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch ratings.", details: error.message });
  }
};

// Increment views for a journal
const incrementViews = async (req, res) => {
  const { id } = req.params;

  try {
    const journal = await Journal.findById(id);
    if (!journal) {
      return res.status(404).json({ error: "Journal not found." });
    }

    journal.views += 1; // Increment views
    await journal.save();

    res.status(200).json({ message: "View count incremented successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to increment views.", details: error.message });
  }
};

// Increment downloads for a journal
const incrementDownloads = async (req, res) => {
  const { id } = req.params;

  try {
    const journal = await Journal.findById(id);
    if (!journal) {
      return res.status(404).json({ error: "Journal not found." });
    }

    journal.downloads += 1; // Increment downloads
    await journal.save();

    res
      .status(200)
      .json({ message: "Download count incremented successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to increment downloads.",
        details: error.message,
      });
  }
};

// Get metrics for a specific journal
const getJournalMetrics = async (req, res) => {
  const { id } = req.params;

  try {
    const journal = await Journal.findById(id);
    if (!journal) {
      return res.status(404).json({ error: "Journal not found." });
    }

    const metrics = {
      views: journal.views,
      downloads: journal.downloads,
      citations: journal.citations,
      ratings: journal.ratings,
      reviews: journal.reviews,
    };

    res.status(200).json(metrics);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch metrics.", details: error.message });
  }
};

// Create a new journal
const createJournal = async (req, res) => {
  const {
    name,
    author,
    institutionId,
    institutionName,
    category,
    publicationFrequency,
  } = req.body;
  const fileUrl = req.file ? `/uploads/journals/${req.file.filename}` : null;

  if (!fileUrl) {
    return res.status(400).json({ error: "File is required" });
  }

  try {
    // Create journal
    const journal = await Journal.create({
      name,
      author,
      institution: institutionId,
      institutionName,
      category,
      publicationFrequency,
      fileUrl,
    });

    // Add journal to institution's journals array
    await Institution.findByIdAndUpdate(
      institutionId,
      { $push: { journals: journal._id } },
      { new: true }
    );

    res.status(201).json(journal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// [Keep all other controller functions the same as in your original file]
// ... (getAllJournals, getJournalById, updateJournal, etc.)

module.exports = {
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
};

module.exports = {
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
};
