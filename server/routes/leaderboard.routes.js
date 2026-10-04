const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline middleware to check for admin authorization
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1] || authHeader;
    if (!token) {
      return res.status(401).json({ message: 'Token not found' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      if (decoded && decoded.role === 'admin') {
        req.admin = decoded;
        next();
      } else {
        return res.status(403).json({ message: 'Admin privileges required' });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

// GET /api/leaderboards - Fetch all leaderboard entries (sorted by score descending, then time taken ascending)
router.get('/', async (req, res) => {
  try {
    const { topicName } = req.query;
    const query = {};
    if (topicName) {
      query.topicName = { $regex: new RegExp(topicName, 'i') };
    }

    const entries = await Leaderboard.find(query)
      .sort({ score: -1, timeTaken: 1, date: -1 })
      .limit(100);

    return res.status(200).json(entries);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve leaderboard entries', error: error.message });
  }
});

// GET /api/leaderboards/:id - Retrieve a specific leaderboard record
router.get('/:id', async (req, res) => {
  try {
    const entry = await Leaderboard.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Leaderboard entry not found' });
    }
    return res.status(200).json(entry);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve leaderboard entry', error: error.message });
  }
});

// POST /api/leaderboards - Create a new leaderboard submission (PUBLIC)
router.post('/', async (req, res) => {
  try {
    const { username, score, timeTaken, topicName } = req.body;

    if (!username || typeof score === 'undefined' || typeof timeTaken === 'undefined' || !topicName) {
      return res.status(400).json({ message: 'Username, score, timeTaken, and topicName are required.' });
    }

    const newEntry = new Leaderboard({
      username: String(username).trim().substring(0, 30) || 'Anonymous Player',
      score: Number(score),
      timeTaken: Number(timeTaken),
      topicName: String(topicName).trim(),
      date: req.body.date || new Date()
    });

    const savedEntry = await newEntry.save();
    return res.status(201).json(savedEntry);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to submit leaderboard entry', error: error.message });
  }
});

// PUT /api/leaderboards/:id - Update an entry (ADMIN ONLY)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { username, score, timeTaken, topicName, date } = req.body;
    
    const entry = await Leaderboard.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Leaderboard entry not found' });
    }

    if (username !== undefined) entry.username = String(username).trim();
    if (score !== undefined) entry.score = Number(score);
    if (timeTaken !== undefined) entry.timeTaken = Number(timeTaken);
    if (topicName !== undefined) entry.topicName = String(topicName).trim();
    if (date !== undefined) entry.date = date;

    const updatedEntry = await entry.save();
    return res.status(200).json(updatedEntry);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update leaderboard entry', error: error.message });
  }
});

// DELETE /api/leaderboards/:id - Delete an entry (ADMIN ONLY)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const entry = await Leaderboard.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Leaderboard entry not found' });
    }
    return res.status(200).json({ message: 'Leaderboard entry deleted successfully', id: req.params.id });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete leaderboard entry', error: error.message });
  }
});

module.exports = router;