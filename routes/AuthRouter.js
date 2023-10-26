const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const AuthController = require("../controllers/AuthController");

router.get("/", auth, AuthController.getWhoRegistered);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/password-reset", AuthController.resetPassword);
router.post("/password-reset/:id/:token", AuthController.resetPasswordConfirm);

module.exports = router;
