const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');

// Admin JWT Secret
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline middleware to check for Admin JWT
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Bearer token missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired admin token' });
      }
      req.admin = decoded;
      next();
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal auth check error', details: err.message });
  }
};

// GET / - PUBLIC list all questions (with optional topicId filter)
router.get('/', async (req, res) => {
  try {
    const { topicId } = req.query;
    const filter = {};
    if (topicId) {
      filter.topicId = topicId;
    }
    const questions = await Question.find(filter);
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve questions', details: error.message });
  }
});

// GET /:id - PUBLIC retrieve a single question by id
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    return res.status(200).json(question);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve question', details: error.message });
  }
});

// POST / - PUBLIC (anyone can create - visitors or administrators)
router.post('/', async (req, res) => {
  try {
    const { topicId, prompt, options, correctAnswer } = req.body;

    // Quick validation
    if (!topicId || !prompt || !options) {
      return res.status(400).json({ error: 'topicId, prompt, and options are required fields' });
    }
    if (correctAnswer === undefined || correctAnswer === null) {
      return res.status(400).json({ error: 'correctAnswer index is required' });
    }

    // Adapt incoming data if it is a comma-separated string
    let parsedOptions = options;
    if (typeof options === 'string') {
      parsedOptions = options.split(',').map(opt => opt.trim());
    }

    const newQuestion = new Question({
      topicId,
      prompt,
      options: parsedOptions,
      correctAnswer: Number(correctAnswer)
    });

    const savedQuestion = await newQuestion.save();
    return res.status(201).json(savedQuestion);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to create question', details: error.message });
  }
});

// PUT /:id - ADMIN ONLY update an existing question
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { topicId, prompt, options, correctAnswer } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (topicId !== undefined) question.topicId = topicId;
    if (prompt !== undefined) question.prompt = prompt;
    if (options !== undefined) {
      let parsedOptions = options;
      if (typeof options === 'string') {
        parsedOptions = options.split(',').map(opt => opt.trim());
      }
      question.options = parsedOptions;
    }
    if (correctAnswer !== undefined) question.correctAnswer = Number(correctAnswer);

    const updatedQuestion = await question.save();
    return res.status(200).json(updatedQuestion);
  } catch (error) {
    return res.status(400).json({ error: 'Failed to update question', details: error.message });
  }
});

// DELETE /:id - ADMIN ONLY remove a question
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    return res.status(200).json({ message: 'Question deleted successfully', id: req.params.id });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete question', details: error.message });
  }
});

module.exports = router;