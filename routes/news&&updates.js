const express = require("express");
const { newsController } = require("../controllers/news&&updateController");
const newsUpdates = express.Router();
// news and updates GET API endpoint
newsUpdates.get("/news/updates", newsController);

module.exports = newsUpdates;
