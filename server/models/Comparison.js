const mongoose = require("mongoose");

const comparisonSchema = new mongoose.Schema({
  users: [String],
  winner: String,
  scores: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comparison", comparisonSchema);