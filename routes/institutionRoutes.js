const express = require("express");
const router = express.Router();
const { getAllInstitutions } = require("../controllers/institutionController");

// GET all institutions
router.get("/", getAllInstitutions);

module.exports = router;
