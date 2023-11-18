const router = require("express").Router();
const { getNotifications, getAllNotifications, createNotification, markNotificationAsRead } = require("../controllers/notification.controllers");
const Auth = require("../middlewares/authentication");

router.get("/", Auth, getNotifications);
router.get("/getAllNotifications", Auth, getAllNotifications);
router.post("/createNotification", createNotification);
router.get("/markIsRead", Auth, markNotificationAsRead);

module.exports = router;
