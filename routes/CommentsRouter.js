const express = require("express");
const router = express.Router();

const CommentsController = require("../controllers/CommentsController");

router.get("/:id", CommentsController.getCommentById);
router.get("/:id/like", CommentsController.getLikesUnderComment);
router.post("/:id/like", CommentsController.createLikeUnderComment);
router.patch("/:id", CommentsController.updateComment);
router.delete("/:id", CommentsController.deleteComment);
router.delete("/:id/like", CommentsController.deleteLikeUnderComment);

module.exports = router;
