const router = require("express").Router();
const { register, login, activationEmailSuccess, updatePassword, forgetPassword, dashboard, logout } = require("../controllers/dashboard.controllers");

router.get("/", dashboard);
router.get("/register", register);
router.get("/login", login);
router.get("/activation-email-success", activationEmailSuccess);
router.get("/forget-password", forgetPassword);
router.get("/update-password", updatePassword);
router.get("/logout", logout);

module.exports = router;
