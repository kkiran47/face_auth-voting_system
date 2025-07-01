const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const compareFacesByUrl = require("../utils/compareFaces");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Register Route
router.post("/register", upload.single("faceImage"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!req.file) return res.status(400).json({ msg: "Face image missing" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const result = await new Promise((resolve, reject) =>
      cloudinary.uploader.upload_stream(
        { folder: "faces", public_id: `user_${Date.now()}` },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      ).end(req.file.buffer)
    );

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role === "admin" ? "admin" : "user", // Default to "user" if not provided
      faceUrl: result.secure_url,
      cloudinaryId: result.public_id
    });

    res.status(201).json({ msg: "Registered successfully", user });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// ✅ Login Route
router.post("/login", upload.single("faceImage"), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!req.file) return res.status(400).json({ msg: "Face image missing" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    // Upload login face image
    const loginUpload = await new Promise((resolve, reject) =>
      cloudinary.uploader.upload_stream(
        { folder: "loginFaces", public_id: `login_${Date.now()}` },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      ).end(req.file.buffer)
    );

    // Save temp login image to user
    user.tempLoginImageId = loginUpload.public_id;
    await user.save();

    // Compare face
    const match = await compareFacesByUrl(user.faceUrl, loginUpload.secure_url);

    // Cleanup temp image
    await cloudinary.uploader.destroy(loginUpload.public_id);
    user.tempLoginImageId = null;
    await user.save();

    if (!match) {
      return res.status(401).json({ msg: "Face mismatch. Please try again." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    res.json({
      token,
      role: user.role, // ✅ Important for frontend redirection
      user
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Login failed" });
  }
});

module.exports = router;
