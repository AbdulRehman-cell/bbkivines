const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    topicId: {
      type: String,
      required: [true, 'Topic ID is required'],
      trim: true,
      index: true
    },
    prompt: {
      type: String,
      required: [true, 'Question prompt is required'],
      trim: true
    },
    options: {
      type: [String],
      required: [true, 'Options are required (array of strings)']
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Index of the correct answer (0-based) is required'],
      min: [0, 'Correct answer index must be 0 or higher']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);