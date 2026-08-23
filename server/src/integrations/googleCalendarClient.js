const { google } = require('googleapis');

const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/google/callback';

  if (!clientId || !clientSecret) {
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const getAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) return null;

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
};

const getTokensFromCode = async (code) => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) throw new Error('Google OAuth credentials not configured');

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

const createCalendarEvent = async (accountToken, eventDetails) => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client || !accountToken?.accessToken) return null;

  oauth2Client.setCredentials({
    access_token: accountToken.accessToken,
    refresh_token: accountToken.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: eventDetails.title,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startIso,
      timeZone: 'UTC',
    },
    end: {
      dateTime: eventDetails.endIso,
      timeZone: 'UTC',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: accountToken.calendarId || 'primary',
    resource: event,
  });

  return response.data.id;
};

const updateCalendarEvent = async (accountToken, eventId, eventDetails) => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client || !accountToken?.accessToken || !eventId) return null;

  oauth2Client.setCredentials({
    access_token: accountToken.accessToken,
    refresh_token: accountToken.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: eventDetails.title,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startIso,
      timeZone: 'UTC',
    },
    end: {
      dateTime: eventDetails.endIso,
      timeZone: 'UTC',
    },
  };

  const response = await calendar.events.update({
    calendarId: accountToken.calendarId || 'primary',
    eventId: eventId,
    resource: event,
  });

  return response.data.id;
};

const deleteCalendarEvent = async (accountToken, eventId) => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client || !accountToken?.accessToken || !eventId) return null;

  oauth2Client.setCredentials({
    access_token: accountToken.accessToken,
    refresh_token: accountToken.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  await calendar.events.delete({
    calendarId: accountToken.calendarId || 'primary',
    eventId: eventId,
  });

  return true;
};

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
};
