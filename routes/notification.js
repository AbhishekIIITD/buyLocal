const express = require("express");
const router = express.Router();

const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead
} = require("../controllers/notification");

// Mark all notifications as read (should be before /:id to avoid conflicts)
router.route("/mark-all-read").put(markAllAsRead);

// Notification routes
router.route("/")
  .get(getNotifications)     // Get user's notifications
  .post(createNotification); // Create new notification

// Mark specific notification as read
router.route("/:id").patch(markAsRead);

module.exports = router;