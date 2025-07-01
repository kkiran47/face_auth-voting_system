const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  faceUrl: String,
  cloudinaryId: String,
  tempLoginImageId: String,

  // ✅ Track all elections the user has voted in
  votedElections: [{ type: String }]
});

module.exports = mongoose.model("User", UserSchema);
