const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Topic = require('../models/Topic');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline requireAdmin middleware
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token is missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.admin = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error in authorization' });
  }
};

// GET /api/topics - List all topics
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find({});
    return res.status(200).json(topics);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve topics', error: error.message });
  }
});

// GET /api/topics/:id - Get a single topic by ID
router.get('/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    return res.status(200).json(topic);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve topic', error: error.message });
  }
});

// POST /api/topics - Create a new topic (Public/Admin can create)
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, active } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required fields' });
    }

    const existingTopic = await Topic.findOne({ slug });
    if (existingTopic) {
      return res.status(400).json({ message: 'A topic with this slug already exists' });
    }

    const newTopic = new Topic({
      name,
      slug,
      description: description || '',
      active: active !== undefined ? active : true
    });

    const savedTopic = await newTopic.save();
    return res.status(201).json(savedTopic);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create topic', error: error.message });
  }
});

// PUT /api/topics/:id - Update an existing topic (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, active } = req.body;
    
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (slug && slug !== topic.slug) {
      const existingTopic = await Topic.findOne({ slug });
      if (existingTopic) {
        return res.status(400).json({ message: 'A topic with this slug already exists' });
      }
    }

    if (name !== undefined) topic.name = name;
    if (slug !== undefined) topic.slug = slug;
    if (description !== undefined) topic.description = description;
    if (active !== undefined) topic.active = active;

    const updatedTopic = await topic.save();
    return res.status(200).json(updatedTopic);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update topic', error: error.message });
  }
});

// DELETE /api/topics/:id - Delete a topic (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedTopic = await Topic.findByIdAndDelete(req.params.id);
    if (!deletedTopic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    return res.status(200).json({ message: 'Topic successfully deleted', topicId: req.params.id });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete topic', error: error.message });
  }
});

module.exports = router;