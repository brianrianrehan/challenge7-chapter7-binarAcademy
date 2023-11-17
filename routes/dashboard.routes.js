const router = require("express").Router();
const { activationEmailSuccess, updatePassword, forgotPassword, register, login } = require("../controllers/dashboard.controllers");
const Auth = require("../middlewares/authentication");

router.get("/register", register);
router.get("/login", login);
router.get("/activation-email-success", activationEmailSuccess);
router.get("/forgot-password", forgotPassword);
router.get("/update-password", Auth, updatePassword);

module.exports = router;
