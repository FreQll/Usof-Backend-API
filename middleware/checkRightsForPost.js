const jwt = require("jsonwebtoken");
const Post = require("../models/PostModel");
const User = require("../models/UserModel");

const checkRightsForPost = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const user = await jwt.verify(token, process.env.SECRET_KEY);
    const { id } = req.params;

    if (user.role !== "admin") {
      const userEntity = new User();
      await userEntity.findByLogin(user.login);
      const post = new Post();
      await post
        .find(id)
        .then((result) => {
          if (!result) {
            return next(res.status(401).send("No such post!"));
          }
          if (result?.author_id != userEntity.user_id) {
            return next(res.status(401).send("Access denied"));
          }
        })
        .catch(() => {
          return next(res.status(401).send("No such post!"));
        });
    }
    return next();
  } catch (err) {
    return next(res.status(401).send("Invalid Token"));
  }
};

module.exports = checkRightsForPost;
