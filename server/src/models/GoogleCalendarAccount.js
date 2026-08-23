const mongoose = require('mongoose');

const googleCalendarAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    accessToken: {
      type: String,
      required: true,
      select: false, // Do not return by default in queries
    },
    refreshToken: {
      type: String,
      select: false, // Do not return by default in queries
    },
    expiryDate: {
      type: Number,
    },
    calendarId: {
      type: String,
      default: 'primary',
    },
    isConnected: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GoogleCalendarAccount', googleCalendarAccountSchema);
