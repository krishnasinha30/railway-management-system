const Notification = require('../models/Notification');
const { success, failure } = require('../utils/apiResponse');

exports.mine = async (req, res, next) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ user: req.user._id, readAt: null })
    ]);
    success(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    if (!notification) return failure(res, 'Notification not found', [], 404);
    success(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    success(res, null, 'Notifications marked as read');
  } catch (error) {
    next(error);
  }
};
