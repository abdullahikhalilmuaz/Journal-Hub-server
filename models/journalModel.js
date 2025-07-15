const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true }, // User who submitted the review
  comment: { type: String, required: true }, // Review comment
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

const journalSchema = new mongoose.Schema({
  name: { type: String, required: true }, // journal name
  author: { type: String, required: true }, // authors name
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  }, // Reference to Institution
  institutionName: { type: String, required: true }, // Institution name for display
  category: { type: String, required: true }, // Category (e.g., Sciences, Education, and languages)
  publicationFrequency: { type: String, required: true }, // Frequency (Monthly, Quarterly, Annually)
  fileUrl: { type: String, required: true }, // Path to the uploaded file
  ratings: [{ type: Number, default: [] }], // Array to store ratings
  reviews: [reviewSchema], // Array to store reviews
  views: { type: Number, default: 0 }, // Number of views
  downloads: { type: Number, default: 0 }, // Number of downloads
  citations: { type: Number, default: 0 }, // Number of citations
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("Journal", journalSchema);
