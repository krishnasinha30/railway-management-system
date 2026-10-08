const Notification = require('../models/Notification');
const { sendWalletCreditEmail } = require('./emailService');

const userRoom = userId => `user:${userId}`;

const notifyUser = async (io, userId, notification, email) => {
  const saved = await Notification.create({
    user: userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    metadata: notification.metadata || {}
  });

  io.to(userRoom(userId)).emit('notification', saved);
  if (email) {
    setImmediate(async () => {
      try {
        const result = await sendWalletCreditEmail(email);
        console.info(`[email] ${result.provider} wallet-credit delivery ${result.messageId} to ${email.email}`);
      } catch (error) {
        console.error(`[email] Could not send wallet-credit email to ${email.email}: ${error.message}`);
      }
    });
  }

  return saved;
};

module.exports = { notifyUser, userRoom };
