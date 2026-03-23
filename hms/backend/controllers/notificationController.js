let nextId = 1;
const notifications = [];

/**
 * Seed notifications for a user if none exist.
 * @param {number} userId
 */
const seedForUser = (userId) => {
  if (notifications.some((n) => n.user_id === userId)) {
    return;
  }
  const now = new Date().toISOString();
  notifications.push(
    {
      id: nextId++,
      user_id: userId,
      title: "Welcome",
      message: "Your Medicare HMS account is ready.",
      type: "info",
      read: false,
      created_at: now,
    },
    {
      id: nextId++,
      user_id: userId,
      title: "Next steps",
      message: "Review patients and upcoming appointments.",
      type: "reminder",
      read: false,
      created_at: now,
    }
  );
};

/**
 * Get notifications for the authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id ?? 0;
    seedForUser(userId);
    const userNotifications = notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({
      success: true,
      data: userNotifications,
      message: "Notifications fetched",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/**
 * Mark a notification as read.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response|void>}
 */
export const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id ?? 0;
    const { id } = req.params;
    const notification = notifications.find(
      (n) => n.user_id === userId && String(n.id) === String(id)
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Notification not found",
      });
    }

    notification.read = true;

    return res.json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
