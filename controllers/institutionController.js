const Institution = require("../models/instituteModel");

// @desc    Get all institutions
// @route   GET /api/institutions
// @access  Public
const getAllInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find({}).select("-password"); // Exclude passwords from the response
    res.status(200).json({
      success: true,
      count: institutions.length,
      data: institutions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllInstitutions,
};
