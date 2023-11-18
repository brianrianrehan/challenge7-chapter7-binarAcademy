const router = require("express").Router();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const User = require("./user.routes");
const Dashboard = require("./dashboard.routes");
const Notifications = require("./notification.routes");
const file = fs.readFileSync("docs/swagger.yaml", "utf8");

// dashboard
router.use("/", Dashboard);

// api docs
const swaggerDocument = YAML.parse(file);
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API
router.use("/api/v1/users", User);
router.use("/api/v1/notifications", Notifications);

module.exports = router;
