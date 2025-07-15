const fs = require("fs");

const newsController = (req, res) => {
  fs.readFile("./database/news&&update.json", "utf8", (err, data) => {
    if (err) {
      res.status(500).json({ message: "What a nice event" });
    } else {
      res.status(200).json(JSON.parse(data));
    }
  });
};
module.exports = { newsController };
