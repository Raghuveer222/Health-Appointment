const asyncHandler = require('../utils/asyncWrapper');
const { getUserNotifications, markAsRead } = require('../services/notificationService');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await getUserNotifications(req.user._id);

  res.status(200).json({
    success: true,
    count: notifications.length,
    notifications,
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await markAsRead(id, req.user._id);

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  res.status(200).json({
    success: true,
    notification: updated,
  });
});

module.exports = {
  getNotifications,
  markNotificationRead,
};
