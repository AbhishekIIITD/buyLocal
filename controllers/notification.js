const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getNotifications(request, response) {
  try {
    const { userId, isRead } = request.query;

    if (!userId) {
      return response.status(400).json({ error: "User ID is required" });
    }

    const whereClause = {
      userId,
      ...(isRead !== undefined && { isRead: isRead === "true" })
    };

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return response.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return response.status(500).json({ error: "Failed to fetch notifications" });
  }
}

async function createNotification(request, response) {
  try {
    const { userId, title, message, type } = request.body;

    if (!userId || !title || !message || !type) {
      return response.status(400).json({ error: "Required fields are missing" });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    });

    return response.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return response.status(500).json({ error: "Failed to create notification" });
  }
}

async function markAsRead(request, response) {
  try {
    const { id } = request.params;
    const { isRead = true } = request.body;

    if (!id) {
      return response.status(400).json({ error: "Notification ID is required" });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead }
    });

    return response.status(200).json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return response.status(500).json({ error: "Failed to update notification" });
  }
}

async function markAllAsRead(request, response) {
  try {
    const { userId } = request.body;

    if (!userId) {
      return response.status(400).json({ error: "User ID is required" });
    }

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return response.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return response.status(500).json({ error: "Failed to mark notifications as read" });
  }
}

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead
};