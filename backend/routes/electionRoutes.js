const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/auth");
const Election = require("../models/Election");
const User = require("../models/User");

// Create election (admin)
router.post("/create", verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, candidates } = req.body;
    const election = new Election({ title, candidates, votes: {} });
    candidates.forEach(c => election.votes.set(c, 0));
    await election.save();
    res.json({ msg: "Election created", election });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get active elections (user)
router.get("/active", verifyToken, async (req, res) => {
  const elections = await Election.find({ active: true });
  res.json(elections);
});

// Vote in election (user)
router.post("/vote/:id", verifyToken, async (req, res) => {
  try {
    const { candidate } = req.body;
    const user = await User.findById(req.user.id);
    if (user.votedElections.includes(req.params.id)) {
      return res.status(400).json({ msg: "Already voted in this election" });
    }

    const election = await Election.findById(req.params.id);
    if (!election || !election.votes.has(candidate)) {
      return res.status(400).json({ msg: "Invalid election or candidate" });
    }

    election.votes.set(candidate, election.votes.get(candidate) + 1);
    await election.save();
    user.votedElections.push(req.params.id);
    await user.save();

    res.json({ msg: "Vote cast successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Admin view results for specific election
router.get("/results/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ msg: "Election not found" });
    res.json({ title: election.title, votes: election.votes });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ msg: "Election not found" });
    res.json(election);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
