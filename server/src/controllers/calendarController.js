const GoogleCalendarAccount = require('../models/GoogleCalendarAccount');
const asyncHandler = require('../utils/asyncWrapper');
const { getAuthUrl, getTokensFromCode } = require('../integrations/googleCalendarClient');
const { logEvent } = require('../utils/logger');

const connectGoogleCalendar = asyncHandler(async (req, res) => {
  const url = getAuthUrl();

  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'Google OAuth credentials not configured on the server.',
    });
  }

  res.status(200).json({
    success: true,
    authUrl: url,
  });
});

const googleCalendarCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Authorization code missing.' });
  }

  const tokens = await getTokensFromCode(code);

  if (req.user) {
    await GoogleCalendarAccount.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiryDate: tokens.expiry_date,
        isConnected: true,
      },
      { upsert: true, new: true }
    );
    logEvent('Calendar', `Google Calendar connected for user ${req.user._id}`);
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  res.redirect(`${clientUrl}/calendar-callback?status=success`);
});

const disconnectGoogleCalendar = asyncHandler(async (req, res) => {
  await GoogleCalendarAccount.findOneAndUpdate(
    { userId: req.user._id },
    { isConnected: false, accessToken: '', refreshToken: '' }
  );

  logEvent('Calendar', `Google Calendar disconnected for user ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: 'Google Calendar disconnected successfully.',
  });
});

const getCalendarStatus = asyncHandler(async (req, res) => {
  const account = await GoogleCalendarAccount.findOne({ userId: req.user._id });

  res.status(200).json({
    success: true,
    isConnected: !!(account && account.isConnected),
  });
});

module.exports = {
  connectGoogleCalendar,
  googleCalendarCallback,
  disconnectGoogleCalendar,
  getCalendarStatus,
};
