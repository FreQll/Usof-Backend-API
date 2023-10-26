const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const checkRightsForUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const userData = await jwt.verify(token, process.env.SECRET_KEY);
    const { id } = req.params;

    if (userData.role !== "admin") {
      const userEntity = new User();
      await userEntity.findByLogin(userData.login);

      const user = new User();
      await user
        .find(id)
        .then(() => {
          if (user.user_id !== userEntity.user_id) {
            return next(res.status(401).send("Access denied"));
          }
        })
        .catch(() => {
          return next(res.status(401).send("No such user!"));
        });
    }
    return next();
  } catch (err) {
    return next(res.status(401).send("Invalid Token"));
  }
};

module.exports = checkRightsForUser;
