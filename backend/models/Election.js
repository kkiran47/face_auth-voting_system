const mongoose = require("mongoose");

const ElectionSchema = new mongoose.Schema({
  title: String,
  candidates: [String],
  votes: {
    type: Map,
    of: Number,
    default: {},
  },
  status: { type: String, enum: ["active", "completed"], default: "active" },
});

module.exports = mongoose.model("Election", ElectionSchema);
