const express = require("express");
const router = express.Router();

const PostController = require("../controllers/PostController");
const checkRightsForPost = require("../middleware/checkRightsForPost");

router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);
router.get("/:id/categories", PostController.getCategoriesOfPost);
router.get("/:id/like", PostController.getLikesOfPost);
router.get("/:id/comments", PostController.getCommentsOfPost);
router.post("/", PostController.createPost);
router.post("/:id/comments", PostController.createCommentUnderPost);
router.post("/:id/like", PostController.createLikeUnderPost);
router.patch("/:id", checkRightsForPost, PostController.updatePost);
router.delete("/:id", checkRightsForPost, PostController.deletePost);
router.delete("/:id/like", PostController.deleteLikeFromPost);

module.exports = router;
