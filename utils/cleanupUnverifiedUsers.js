const User = require('../models/user');

const cleanupUnverifiedUsers = async () => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  try {
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: oneHourAgo }
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Deleted ${result.deletedCount} unverified users`);
    }
  } catch (err) {
    console.error('🛑 Cleanup error:', err);
  }
};

module.exports = cleanupUnverifiedUsers;
