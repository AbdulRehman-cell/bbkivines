const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Topic slug is required'],
      trim: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Topic', topicSchema);