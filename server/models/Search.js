const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema({
  username: String,
  score: Number,
  searchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Search", searchSchema);
