const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Song = require("../models/songModel");
const Playlist = require("../models/playlistModel");
const getVideoData = require("../APIs/getVideoData");

//@desc Adds new song
//@route POST api/songs/add
//@access private
const addSong = asyncHandler(async (req, res) => {
  const { name, ytURL, authors, categories } = req.body;

  // <---- Checking if user sent all necessary fields ---->
  if (!ytURL) {
    res.status(400).json({ message: "You need to fulfill all fields!" });
    throw new Error("You need to fulfill all fields!");
  }

  // <---- Checking if user with given YouTube URL exists ---->
  const existingSong = await Song.findOne({ ytURL });
  if (existingSong) {
    res
      .status(400)
      .json({ message: "Song with this YouTube URL already exists!" });
    throw new Error("Song with this YouTube URL already exists!");
  }

  // <---- Checking if user send any categories ---->
  let newCategories;
  if (categories && categories.length > 0) {
    newCategories = categories;

    // <---- Mapping expected array of objects to array of strings(id) ---->
    if ("_id" in newCategories[0]) {
      newCategories = newCategories.map((category) => category._id);
    }
  } else {
    newCategories = [];
  }

  // <---- Using YouTube API to get thumbnail in Base64 format ---->
  const songData = await getVideoData(ytURL);

  // <---- Creating new song ---->
  const newSong = {
    name: songData.name,
    userID: req.user.id,
    ytURL,
    thumbnail: songData.thumbnail,
    authors,
    categories: newCategories,
    likes: [],
  };
  const song = await Song.create(newSong);

  if (song) {
    console.log("New song created! ", song);
    res.status(201).json(song);
  } else {
    res.status(400).json({ message: "Song data was not valid!" });
    throw new Error("Song data was not valid!");
  }
});

//@desc Edits an existing song, only author and categories
//@route GET api/songs/edit/:songID
//@access private
const editSong = asyncHandler(async (req, res) => {
  const songID = req.params.songID;
  const { authors, categories } = req.body;

  // <---- Finding a song with ID fiven i params ---->
  const song = await Song.findById(songID);
  if (!song) {
    req.status(400).json({ message: "There is no song with this ID!" });
    throw new Error("There is no song with this ID!");
  }

  // <---- Checking if user have permission to modify this song ---->
  if (req.user.id !== song.userID) {
    req
      .status(401)
      .json({ message: "You don't have permission to edit this song!" });
    throw new Error("You don't have permission to edit this song!");
  }

  // <---- Updating the song with the new data ---->
  song.authors = authors;

  // Clearing the existing categories and adding the new ones
  if (categories && categories.length > 0) {
    song.categories = categories;
  } else {
    song.categories = [];
  }
  // <---- Saving the updated song in the database ---->
  const updatedSong = await song.save();

  // <---- Sending the updated song as a response ---->
  res.status(200).json(updatedSong);
});

//@desc Sending list of all songs
//@route GET api/songs/all
//@access public
const getAllSongs = asyncHandler(async (req, res) => {
  const songList = await Song.find()
    .populate("userID", "username")
    .populate("authors", "name")
    .populate("categories", "name");
  if (!songList) {
    res.status(500).json({
      message: "There was a problem trying to get Songs from the database!",
    });
    throw new Error(
      "There was a problem trying to get Songs from the database!"
    );
  } else {
    res.status(200).json(songList);
  }
});

//@desc sending list of all song of given author
//@route POST api/songs/author/:authorID
//@access public
const getSongsByAuthor = asyncHandler(async (req, res) => {
  const authorID = req.params.authorID;

  // <---- Checking if the provided author id is valid ---->
  if (!mongoose.Types.ObjectId.isValid(authorID)) {
    res.status(400).json({ message: "Invalid author" });
    throw new Error("Invalid author");
  }

  // <---- Finding songs by the provided authorId ---->
  const songs = await Song.find({ authors: { $in: [authorID] } })
    .populate("userID", "username")
    .populate("authors", "name")
    .populate("categories", "name")
    .exec();

  if (songs.length > 0) {
    res.status(200).json(songs);
  } else {
    res.status(404).json({ message: "No songs with this author found!" });
    throw new Error("No songs with this author found!");
  }
});

//@desc sending list of all song of given category
//@route POST api/song/category/:categoryID
//@access public
const getSongsByCategory = asyncHandler(async (req, res) => {
  const categoryID = req.params.categoryID;

  // <---- Checking if the provided category id is valid ---->
  if (!mongoose.Types.ObjectId.isValid(categoryID)) {
    res.status(400).json({ message: "Invalid category" });
    throw new Error("Invalid category");
  }

  // <---- Finding songs by the provided categoryID ---->
  const songs = await Song.find({ categories: { $in: [categoryID] } })
    .populate("userID", "username")
    .populate("authors", "name")
    .populate("categories", "name")
    .exec();

  if (songs.length > 0) {
    res.status(200).json(songs);
  } else {
    res.status(404).json({ message: "No songs with this author found!" });
    throw new Error("No songs with this author found!");
  }
});

//@desc sending list of all song of given category
//@route POST api/song/most-liked/:count
//@access public
const getMostLikedSongs = asyncHandler(async (req, res) => {
  const count = parseInt(req.params.count);

  // make sure count is a valid number
  if (isNaN(count) || count <= 0) {
    return res.status(400).json({ message: "Invalid count parameter" });
  }

  // Get all the songs and sort them by descending number of likes with the limit of 'count'
  const songs = Song.find({}).sort({ "likes.length": -1 }).limit(count);
  if (!songs) {
    res.status(500).json({
      message: "There was a problem trying to get Songs from the database!",
    });
  }

  res.status(200).json(songs);
});

//@desc Sending a random song
//@route GET api/songs/random
//@access public
const getRandomSong = asyncHandler(async (req, res) => {
  const randomSong = await Song.aggregate([{ $sample: { size: 1 } }])
    .populate("userID", "username")
    .populate("authors", "name")
    .populate("categories", "name")
    .exec();

  if (!randomSong) {
    res.status(500).json({
      message: "There was a problem trying to get a Song from the database!",
    });
    throw new Error(
      "There was a problem trying to get a Song from the database!"
    );
  } else {
    res.status(200).json(randomSong);
  }
});

//@desc Likes a song
//@route POST api/songs/:songID/like
//@access private
const likeSong = asyncHandler(async (req, res) => {
  const songID = req.params.songID;

  // <---- Checking if the provided song id is valid ---->
  if (!mongoose.Types.ObjectId.isValid(songID)) {
    res.status(400).json({ message: "Invalid song id" });
    throw new Error("Invalid song");
  }

  // <---- Finding the song in the database ---->
  const song = await Song.findById(songID);

  if (!song) {
    res.status(500).json({
      message:
        "There was a problem trying to get a song object from the database!",
    });
    throw new Error(
      "There was a problem trying to get a song object from the database!"
    );
  }

  // <---- Placing/taking like (current user ID) into/from song's likes array ---->
  const userLiked = song.likes.includes(req.user.id);

  const update = userLiked
    ? { $pull: { likes: req.user.id } }
    : { $push: { likes: req.user.id } };

  const updatedSong = await Song.findOneAndUpdate({ _id: songID }, update, {
    new: true,
  });

  if (updatedSong) {
    const message = userLiked
      ? "The song has been disliked!"
      : "The song has been liked!";
    res.status(200).json({ message });
  } else {
    res.status(400).json({ message: "Failed to update song!" });
  }
});

//@desc deletes a song
//@route DELETE api/songs/:songID/delete
//@access private
const deleteSong = asyncHandler(async (req, res) => {
  const songID = req.params.songID;

  // <---- Checking if the provided song id is valid ---->
  if (!mongoose.Types.ObjectId.isValid(songID)) {
    res.status(400).json({ message: "Invalid song ID!" });
    throw new Error("Invalid song!");
  }

  // <---- Finding the song in the database ---->
  const song = await Song.findById(songID);
  if (!song) {
    res.status(500).json({
      message:
        "There was a problem trying to get the song object from the database!",
    });
    throw new Error(
      "There was a problem trying to get the song object from the database!"
    );
  }

  // <---- Checking if the current user is the song's creator ---->
  if (song.userID.toString() !== req.user.id) {
    res
      .status(403)
      .json({ message: "You cannot delete song that was not added by you!" });
    res
      .status(403)
      .json({ message: "You cannot delete song that was not added by you!" });
    throw new Error("You cannot delete song that was not added by you!");
  }

  // <---- Deleting this song from every playlist ---->
  const deleteSongsFromPlaylists = async (songID) => {
    const filter = { songs: { $in: [songID] } };
    const update = { $pull: { songs: songID } };

    try {
      const response = await Playlist.updateMany(filter, update);
      return response;
    } catch (error) {
      res
        .status(400)
        .json({ message: "failed to delete song from all playlists", error });
    }
  };

  const response = await deleteSongsFromPlaylists(song._id);

  // <---- Deleting song and sending the response ---->
  await song.deleteOne();
  res.status(200).json({ message: "Song deleted!" });
});

//@desc Gives a category to a song
//@route DELETE api/songs/give-category/:songID/:categoryID
//@access private
const giveCategory = asyncHandler(async (req, res) => {
  const { songID, categoryID } = req.params;

  // <---- Checking if the provided song id is valid ---->
  if (
    !mongoose.Types.ObjectId.isValid(songID) ||
    !mongoose.Types.ObjectId.isValid(CategoryID)
  ) {
    res.status(400).json({ message: "Invalid or Category!!" });
    throw new Error("Invalid or Category!!");
  }

  // <---- Finding the song in the database ---->
  const song = await Song.findById(songID);
  if (!song) {
    res.status(500).json({
      message:
        "There was a problem trying to get the song object from the database!",
    });
    throw new Error(
      "There was a problem trying to get the song object from the database!"
    );
  }

  // <---- Finding the category in the database ---->
  const category = await Category.findById(categoryID);
  if (!category) {
    res.status(400).json({ message: "Category not found!" });
    throw new Error("Category not found!");
  }

  // <---- Checking if user have permission to modify this song ---->
  if (!req.user.id == song.userID) {
    req
      .status(401)
      .json({ message: "You don't have permission to edit this song!" });
    throw new Error("You don't have permission to edit this song!");
  }

  song.categories.push(new mongoose.Types.ObjectId(categoryID));
  await song.save();
  res.status(200).json({ message: "song have been updated!" });
});

module.exports = {
  addSong,
  getAllSongs,
  getRandomSong,
  getMostLikedSongs,
  getSongsByAuthor,
  getSongsByCategory,
  editSong,
  likeSong,
  deleteSong,
  giveCategory,
};
