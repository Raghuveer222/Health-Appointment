const express = require('express');
const router = express.Router();
const {
  connectGoogleCalendar,
  googleCalendarCallback,
  disconnectGoogleCalendar,
  getCalendarStatus,
} = require('../controllers/calendarController');
const authenticate = require('../middleware/auth');

router.get('/google/connect', authenticate, connectGoogleCalendar);
router.get('/google/callback', googleCalendarCallback);
router.delete('/google/disconnect', authenticate, disconnectGoogleCalendar);
router.get('/status', authenticate, getCalendarStatus);

module.exports = router;
