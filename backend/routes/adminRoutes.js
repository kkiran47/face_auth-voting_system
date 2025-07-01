const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/auth");
const Election = require('../models/Election');

// ✅ Create election (optional)
router.post('/add-election', verifyToken, isAdmin, async (req, res) => {
  const { title, candidates } = req.body;

  const newElection = new Election({
    title,
    candidates,
    votes: candidates.reduce((obj, c) => {
      obj[c] = 0;
      return obj;
    }, {}),
    status: 'active'
  });

  await newElection.save();
  res.json({ msg: 'Election added', newElection });
});

// ✅ Fetch all elections
router.get("/elections", verifyToken, isAdmin, async (req, res) => {
  try {
    const elections = await Election.find({});
    res.json(elections);
  } catch (err) {
    res.status(500).json({ msg: "Failed to load elections" });
  }
});
router.patch('/complete/:id', verifyToken, isAdmin, async (req, res) => {
  const election = await Election.findById(req.params.id);
  if (!election) return res.status(404).json({ msg: 'Election not found' });

  election.status = 'completed';
  await election.save();
  res.json({ msg: 'Election marked as completed' });
});


module.exports = router;
