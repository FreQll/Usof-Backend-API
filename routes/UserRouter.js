const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const checkAdminRights = require("../middleware/checkAdminRights");
const UserController = require("../controllers/UserController");

const checkRightsForUser = require("../middleware/checkRightsForUser");

router.use(
  fileUpload({
    limits: {
      fileSize: 10000000,
    },
    abortOnLimit: true,
  })
);

router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.get("/profile/:login", UserController.getUserByLogin);
router.post("/", checkAdminRights, UserController.createUser);
router.get("/avatar/*.jpg", UserController.getUserAvatar);
router.patch("/avatar", UserController.updateUserAvatar);
router.patch("/:id", checkRightsForUser, UserController.updateUserData);
router.delete("/:id", checkRightsForUser, UserController.deleteUser);

router.get("/:id/favorites", UserController.getFavoritePosts);
router.post("/:id/favorites", UserController.addFavoritePost);
router.delete("/:id/favorites", UserController.deleteFavoritePost);

module.exports = router;
