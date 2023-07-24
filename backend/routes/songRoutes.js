const express = require("express");
const router = express.Router();

const validateToken = require("../middleware/validateTokenHandler");

const {
  addSong,
  getAllSongs,
  getRandomSong,
  getSongsByAuthor,
  getSongsByCategory,

} = require("../controllers/songController");

router.post("/add", validateToken, addSong);

router.get("/all", getAllSongs);

router.get("/random", getRandomSong);

router.get("/author/:authorID", getSongsByAuthor);

router.get("/category/:categoryID", getSongsByCategory);

module.exports = router;
