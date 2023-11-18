const router = require("express").Router();
const User = require("./user.routes");
const Dashboard = require("./dashboard.routes");
const Notifications = require("./notification.routes");

// Dashboard
router.use("/", Dashboard);

// API
router.use("/api/v1/users", User);
router.use("/api/v1/notifications", Notifications);

module.exports = router;
