const router = require("express").Router();
const { register, login, authenticateUser, updateProfile, activate } = require("../controllers/user.controllers");
const { image } = require("../libs/multer");
const Auth = require("../middlewares/authentication");

router.post("/register", register);
router.post("/login", login);
router.post("/email-activation", activate);
router.get("/authenticate", Auth, authenticateUser);
router.put("/updateProfile", Auth, image.single("image"), updateProfile);

module.exports = router;
