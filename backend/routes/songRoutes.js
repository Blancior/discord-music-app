const express = require("express");
const router = express.Router();

const validateToken = require("../middleware/validateTokenHandler");

const {
  addSong,
  getAllSongs,
  getRandomSong,
  getSongsByAuthor,
  getSongsByCategory,
  editSong,
  likeSong,
} = require("../controllers/songController");

router.post("/add", validateToken, addSong);

router.post("/edit/:songID", validateToken, editSong);

router.get("/all", getAllSongs);

router.get("/random", getRandomSong);

router.get("/author/:authorID", getSongsByAuthor);

router.get("/category/:categoryID", getSongsByCategory);

router.post("/:songID/like", validateToken ,likeSong)



module.exports = router;
