const Post = require("../models/PostModel");
const Comment = require("../models/CommentModel");
const Like = require("../models/LikeModel");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");

class PostController {
  async getAllPosts(req, res) {
    const {
      page,
      pageSize,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
      statusFilter,
    } = req.query;

    const currentPage = page ? parseInt(page) : 1;
    const limit = pageSize ? parseInt(pageSize) : 5;
    const offset = (currentPage - 1) * limit;
    const sortColumn = sortBy === "rating" ? "rating" : "publish_date";
    const sortColumnOrder = sortOrder ? sortOrder : "DESC";

    if (currentPage <= 0) {
      return res.status(400).send("Invalid page number, should start with 1");
    }

    const dateFilterQuery =
      dateFrom && dateTo
        ? `AND publish_date BETWEEN '${dateFrom}' AND '${dateTo}'`
        : "";
    const statusFilterQuery = statusFilter
      ? `AND status = '${statusFilter}'`
      : "";

    const posts = new Post();
    const query = `
    SELECT p.* 
    FROM posts p
    WHERE 1=1 ${dateFilterQuery} ${statusFilterQuery}
    ORDER BY ${sortColumn} ${sortColumnOrder}
    LIMIT ${limit} OFFSET ${offset}
`;
    try {
      posts.query(query).then((result) => {
        res.status(200).send(result);
      });
    } catch (err) {
      res.status(500).send({ status: 500, message: err.message });
    }
  }

  async getPostById(req, res) {
    const { id } = req.params;
    const post = new Post();
    post
      .find(id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(500).send({ status: 500, message: err.message });
      });
  }

  async getCategoriesOfPost(req, res) {
    const { id } = req.params;
    const post = new Post();
    post
      .getAllCategoriesForPost(id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(500).send({ status: 500, message: err.message });
      });
  }

  async getLikesOfPost(req, res) {
    const { id } = req.params;
    const post = new Post();
    post
      .getAllLikesForPost(id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(500).send({ status: 500, message: err.message });
      });
  }

  async getCommentsOfPost(req, res) {
    const { id } = req.params;
    const post = new Post();
    post
      .getAllCommentsForPost(id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(500).send({ status: 500, message: err.message });
      });
  }

  async createPost(req, res) {
    const { title, content, author_id, categories } = req.body;
    if (!title || !content || !author_id || !categories) {
      return res
        .status(400)
        .send({ status: 400, message: "Missing required parameters" });
    }

    try {
      const user = new User();
      await user.find(author_id);
      if (!user.user_id) {
        return res.status(404).send({
          status: 404,
          message:
            "User does not exist. Cannot create a post for a non-existent user.",
        });
      }
      const post = new Post(title, content, author_id);
      await post.save();

      const post_id = await post.getLastPostId();
      if (Array.isArray(categories)) {
        categories.forEach(async (category) => {
          await post.save_categories(post_id, category);
        });
      } else {
        await post.save_categories(post_id, categories);
      }

      res.send({
        status: 200,
        message: "Post created successfully!",
        post: post,
      });
    } catch (err) {
      res.status(500).send({ status: 500, message: err.message });
    }
  }

  async createCommentUnderPost(req, res) {
    const { author_id, content } = req.body;
    const { id } = req.params;

    if (!author_id || !content) {
      return res
        .status(400)
        .send({ status: 400, message: "Missing required parameters" });
    }

    try {
      const user = new User();
      const userResult = await user.find(author_id);
      if (!userResult) {
        return res.status(404).send({
          status: 404,
          message:
            "User does not exist. Cannot create a comment for a non-existent user.",
        });
      }

      const post = new Post();
      const postResult = await post.find(id);
      if (!postResult) {
        return res.status(404).send({
          status: 404,
          message:
            "Post does not exist. Cannot create a comment for a non-existent post.",
        });
      }

      const comment = new Comment(author_id, id, content);
      comment.save();
      res.status(200).send({
        status: 200,
        message: "Comment added successfully!",
        comment: comment,
      });
    } catch (err) {
      return res.status(500).send({ status: 500, message: err.message });
    }
  }

  async createLikeUnderPost(req, res) {
    const { user_id, type } = req.body;
    const { id } = req.params;

    if (!user_id) {
      return res
        .status(400)
        .send({ status: 400, message: "Missing required parameters" });
    }

    if (type !== "like" && type !== "dislike") {
      type = "like";
    }

    try {
      const post = new Post();
      const postResult = await post.find(id);

      if (!postResult || !postResult.post_id) {
        return res.status(404).send({
          status: 404,
          message:
            "Post does not exist. Cannot create a like for a non-existent post.",
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

      like
        .findPostLike(user_id, id)
        .then(async (result) => {
          if (result[0].length > 0) {
            return res.status(404).send({
              status: 404,
              message: "You can't like a post twice!",
            });
          } else {
            const newLike = new Like(id, user_id, null, type);

            await newLike.save();
            const ratingResult = await newLike.calculateRatingUnderPost(id);

            const post = new Post();
            await post.find(id);

            post.rating =
              Number(ratingResult[0].rating) + (type === "like" ? 1 : -1);
            await post.save();

            const updateUserRating = new User();
            await updateUserRating.find(post.author_id);
            const userRating = await newLike.calculateUserRating(
              post.author_id
            );
            updateUserRating.rating = userRating[0].total_rating;
            await updateUserRating.save();

            res.status(200).send({
              status: 200,
              message: "Like added successfully!",
              like: newLike,
            });
          }
        })
        .catch((err) => {
          return res.status(500).send({
            status: 500,
            message: err.message,
          });
        });
    } catch (err) {
      return res.status(500).send({
        status: 500,
        message: err.message,
      });
    }
  }

  async updatePost(req, res) {
    const { id } = req.params;
    const { title, content, rating, status } = req.body;
    const post = new Post();
    post
      .find(id)
      .then((result) => {
        if (result.post_id) {
          post.post_id = result.post_id;
          post.title = title ? title : result.title;
          post.content = content ? content : result.content; //i think we should not allow to change author_id or publish_date
          post.rating = rating ? rating : result.rating;
          post.status = status ? status : result.status;
          post.save();
          res.status(200).send({
            status: 200,
            message: "Post updated successfully!",
            post: post,
          });
        } else {
          res
            .status(404)
            .send({ status: 404, message: "Post does not exist!" });
        }
      })
      .catch((err) => {
        res.status(500).send({ status: 500, message: err.message });
      });
  }

  async deletePost(req, res) {
    const { id } = req.params;
    const post = new Post();
    post
      .find(id)
      .then((result) => {
        post.delete(id);
        return res
          .status(200)
          .send({ status: 200, message: "Post deleted successfully!" });
      })
      .catch((err) => {
        return res.status(500).send({ status: 500, message: err.message });
      });
  }

  async deleteLikeFromPost(req, res) {
    const { id } = req.params;
    const like = new Like();

    try {
      const token = req.cookies.token;
      const userData = jwt.verify(token, process.env.SECRET_KEY);

      const user = new User();
      await user.findByLogin(userData.login);

      const result = await like.findPostLike(user.user_id, id);
      const type = result[0][0].type;

      if (result[0][0].like_id) {
        await like.delete(result[0][0].like_id);

        const newLike = new Like();
        const ratingResult = await newLike.calculateRatingUnderPost(id);

        const post = new Post();
        await post.find(id);
        post.rating =
          Number(ratingResult[0].rating) + (type === "like" ? -1 : 1);
        await post.save();

        const updateUserRating = new User();
        await updateUserRating.find(post.author_id);
        const userRating = await newLike.calculateUserRating(post.author_id);
        updateUserRating.rating = userRating[0].total_rating;
        await updateUserRating.save();

        return res.status(200).send({
          status: 200,
          message: "Like deleted successfully!",
        });
      } else {
        return res.status(404).send({
          status: 404,
          message: "You can't delete a like from a comment!",
        });
      }
    } catch (err) {
      res.status(400).send({ status: 400, message: "Like does not exist!" });
    }
  }
}

module.exports = new PostController();
