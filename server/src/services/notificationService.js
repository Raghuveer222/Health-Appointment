const Notification = require('../models/Notification');
const { logEvent } = require('../utils/logger');

const createNotification = async ({ userId, type, title, message, appointmentId }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      appointmentId,
    });
    logEvent('Notification', `Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (err) {
    console.error(`[Notification Error] ${err.message}`);
    return null;
  }
};

const getUserNotifications = async (userId, limit = 20) => {
  return await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
};
