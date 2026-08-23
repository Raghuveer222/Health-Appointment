const mongoose = require('mongoose');

const aiInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['PRE_VISIT', 'POST_VISIT'],
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    rawResponse: {
      type: String,
      default: '',
    },
    parsedOutput: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FALLBACK_USED', 'FAILED'],
      default: 'SUCCESS',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIInteraction', aiInteractionSchema);
