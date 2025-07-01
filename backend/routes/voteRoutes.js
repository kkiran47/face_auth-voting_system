const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Election = require('../models/Election');

// ✅ 1. Get Active Elections
router.get('/active', verifyToken, async (req, res) => {
  try {
    const elections = await Election.find({ status: 'active' });
    res.json(elections);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch active elections.' });
  }
});
// ✅ 2. Cast Vote
router.post('/:id', verifyToken, async (req, res) => {
  const { candidate } = req.body;
  console.log("Candidate sent from frontend:", candidate);

  try {
    const user = await User.findById(req.user.id);
    const election = await Election.findById(req.params.id);

    if (!election || !election.votes.has(candidate)) {
      return res.status(400).json({ msg: 'Invalid vote or election not found' });
    }

    if (user.votedElections.includes(req.params.id)) {
      return res.status(400).json({ msg: 'You have already voted in this election' });
    }

    // ✅ Cast vote (for Map)
    const currentVotes = election.votes.get(candidate) || 0;
    election.votes.set(candidate, currentVotes + 1);
    await election.save();

    user.votedElections.push(req.params.id);
    await user.save();

    res.json({ msg: 'Vote cast successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Voting failed', error: err.message });
  }
});

// ✅ 3. All completed election results (Public)
router.get("/results", async (req, res) => {
  try {
    const elections = await Election.find({ status: 'completed' });
    res.json(elections);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch election results" });
  }
});

// ✅ 4. Single election result (Public)
router.get('/results/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ msg: 'Election not found' });

    if (election.status !== 'completed') {
      return res.status(403).json({ msg: 'Results not yet available for this election' });
    }

    res.json({ title: election.title, votes: election.votes });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch results' });
  }
});

router.get("/my-result", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const elections = await Election.find({
      _id: { $in: user.votedElections },
      status: "completed"
    });

    if (!elections.length) {
      return res.status(404).json({ msg: "No completed elections you've voted in." });
    }

    res.json(elections);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch your election results." });
  }
});

module.exports = router;
