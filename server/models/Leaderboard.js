const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
      default: 0
    },
    timeTaken: {
      type: Number,
      required: [true, 'Time taken is required'],
      min: [0, 'Time taken cannot be negative'],
      default: 0
    },
    topicName: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
      default: 'General Trivia'
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes to quickly fetch top leaders for the arcade leaderboard dashboard
leaderboardSchema.index({ topicName: 1, score: -1, timeTaken: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);