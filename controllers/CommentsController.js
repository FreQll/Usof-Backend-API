const Comment = require("../models/CommentModel.js");
const Like = require("../models/LikeModel");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");

class CommentsController {
  async getCommentById(req, res) {
    const { id } = req.params;
    const comment = new Comment();

    comment
      .find(id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(() => {
        res
          .status(404)
          .send({ status: 404, message: "Comment does not exist!" });
      });
  }

  async getLikesUnderComment(req, res) {
    const { id } = req.params;

    const comment = new Comment();
    comment
      .getAllLikesForComment(id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res
          .status(500)
          .send({ status: 500, code: err.code, message: err.message });
      });
  }

  async createLikeUnderComment(req, res) {
    const { id } = req.params;
    let { user_id, type } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .send({ status: 400, message: "Missing required parameters" });
    }

    if (type !== "like" && type !== "dislike") {
      type = "like";
    }

    try {
      const comment = new Comment();
      const commentResult = await comment.find(id);

      if (!commentResult || !commentResult.comment_id) {
        return res.status(404).send({
          status: 404,
          message:
            "Comment does not exist. Cannot create a like for a non-existent comment.",
        });
      }

      const user = new User();
      const userResult = await user.find(user_id);

      if (!userResult || !userResult.user_id) {
        return res.status(404).send({
          status: 404,
          message:
            "User does not exist. Cannot create a like for a non-existent user.",
        });
      }

      const like = new Like();
      const result = await like.findCommentLike(user_id, id);

      if (result) {
        return res.status(400).send({
          status: 400,
          message: "You can't like a comment twice!",
        });
      } else {
        const newLike = new Like(null, user_id, id, type);
        await newLike.save();
        const ratingResult = await newLike.calculateRatingUnderComment(id);

        const comment = new Comment();
        await comment.find(id);
        comment.rating =
          Number(ratingResult[0].rating) + (type === "like" ? 1 : -1);
        await comment.save();

        const updateUserRating = new User();
        await updateUserRating.find(comment.author_id);
        const userRating = await newLike.calculateUserRating(comment.author_id);
        updateUserRating.rating = userRating[0].total_rating;
        await updateUserRating.save();

        res.status(200).send({
          status: 200,
          message: "Like added successfully!",
          like: newLike,
        });
      }
    } catch (err) {
      return res.status(500).send({ status: 500, message: err.message });
    }
  }

  async updateComment(req, res) {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).send({ status: 400, message: "Missing content!" });
    }

    const comment = new Comment();
    comment
      .find(id)
      .then((result) => {
        if (result.comment_id) {
          comment.comment_id = result.comment_id;
          comment.content = content ? content : result.content;
          comment.save();
          res.status(200).send({
            status: 200,
            message: "Comment updated successfully!",
            comment: comment,
          });
        } else {
          res
            .status(404)
            .send({ status: 404, message: "Comment does not exist!" });
        }
      })
      .catch((err) => {
        res
          .status(500)
          .send({ status: 500, code: err.code, message: err.message });
      });
  }

  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const comment = new Comment();
      comment
        .find(id)
        .then(() => {
          comment.delete(id);
          res.status(200).send({
            status: 200,
            message: "Comment deleted successfully!",
          });
        })
        .catch(() => {
          res
            .status(404)
            .send({ status: 404, message: "Comment does not exist!" });
        });
    } catch (err) {
      res.status(500).send({ status: 500, message: err.message });
    }
  }

  async deleteLikeUnderComment(req, res) {
    const { id } = req.params;
    const like = new Like();

    let userData;
    try {
      const token = req.cookies.token;
      userData = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }

    const user = new User();
    try {
      const userResult = await user.findByLogin(userData.login);

      const result = await like.findCommentLike(userResult[0].user_id, id);
      if (result[0].length > 0) {
        const type = result[0][0].type;
        if (result[0][0].like_id) {
          like.delete(result[0][0].like_id);

          const newLike = new Like();
          const ratingResult = await newLike.calculateRatingUnderComment(id);
          const comment = new Comment();
          await comment.find(id);
          comment.rating =
            Number(ratingResult[0].rating) + (type === "like" ? -1 : 1);
          await comment.save();

          const updateUserRating = new User();
          await updateUserRating.find(comment.author_id);
          const userRating = await newLike.calculateUserRating(
            comment.author_id
          );
          updateUserRating.rating = userRating[0].total_rating;
          await updateUserRating.save();

          return res.status(200).send({
            status: 200,
            message: "Like deleted successfully!",
          });
        }
        return res.status(404).send({
          status: 404,
          message: "You can't delete a like from the comment.",
        });
      }
    } catch (err) {
      return res.status(500).send({ status: 500, message: err.message });
    }
  }
}

module.exports = new CommentsController();
