const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Playlist = require("../models/playlistModel");
const ObjectId = mongoose.Types.ObjectId;

//@desc Adds a new playlist
//@route POST api/playlists/add
//@access private
const addPlaylist = asyncHandler(async (req, res) => {
  const { name, songs, pictureURL } = req.body;

  // <---- Checking playlist's name has been provided ---->
  if (!name) {
    res.status(400).json({ message: "You need prive the playlist's name!" });
  }

  // <---- Checking if user with given YouTube URL exists ---->
  const existingPlaylist = await Playlist.findOne({ name });
  if (existingPlaylist) {
    res
      .status(400)
      .json({ message: "Playlist with this name already exists!" });
  }

  // <---- Checking if array with song's IDs' have been provided ---->
  let newSongs;
  if (songs && songs.length > 0) {
    newSongs = songs;
  } else {
    newSongs = [];
  }

  // <---- Creating newPlaylist Object and saving it in the dataBase ---->
  const newPlaylist = {
    name,
    newSongs,
    authorID: req.user.id,
    pictureURL,
  };

  const playlist = await Playlist.create(newPlaylist);
  if (playlist) {
    res.status(201).json(playlist);
  } else {
    console.log("New playlist couldn't be saved in the dataBase");
    res.status(400).json({ message: "Playlist data was not valid!" });
  }
});

//@desc Adds a new playlist
//@route POST api/playlists/edit/:playlistID
//@access private
editPlaylist = asyncHandler(async (req, res) => {
  const playlistID = req.params.playlistID;
  const { name, songs, authorID, pictureURL } = req.body;

  const playlist = await Playlist.findById(playlistID);
  if (!playlist) {
    res
      .status(400)
      .json({ message: "Playlist with this ID not found in the dataBase" });
  }

  // <---- Checking if user have permission to modify this playlist ---->
  if (req.user.id != playlist.authorID) {
    res
      .status(403)
      .json({ message: "You don't have permission to edit this playlist" });
  }

  //<---- Updating and saving playlist ---->
  playlist.name = name;
  playlist.songs = songs;
  playlist.pictureURL = pictureURL;
  const saved = await playlist.save();
  res.status(200).json({ message: "Playlist successfully updated" });
});

//@desc Adds a new playlist
//@route POST api/playlists/:playlistID/delete
//@access private
const deletPlaylist = asyncHandler(async (req, res) => {
  const playlistID = req.params.playlistID;

  if (!ObjectId.isValid(playlistID))
  {
    res.status(400).json({ message: "Not valid playlistID" });
  }

  const playlist = await Playlist.findById(playlistID);
  if (!playlist) {
    res
      .status(400)
      .json({ message: "Playlist with this ID not found in the dataBase" });
  }

  // <---- Checking if user have permission to delete this playlist ---->
  if (req.user.id != playlist.authorID) {
    res
      .status(403)
      .json({ message: "You don't have permission to delete this playlist" });
  }

  const response = await Playlist.findByIdAndDelete(playlistID);
  if (!response) {
    res
      .status(400)
      .json({ message: "Error while trying to delete playlist from dataBase" });
  }

  res.status(200).json({ message: "Playlist successfully deleted" });
});

module.exports = {
  addPlaylist,
  editPlaylist,
  deletPlaylist,
};
