const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");

router.post("/", async (req, res) => {
  const { loginImageId } = req.body;
  if (!loginImageId) return res.status(400).json({ msg: "Missing image ID" });

  try {
    await cloudinary.uploader.destroy(loginImageId);
    res.json({ msg: "Logged out and face image deleted" });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    res.status(500).json({ msg: "Failed to delete login image" });
  }
});

module.exports = router;