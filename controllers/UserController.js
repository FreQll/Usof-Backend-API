const User = require("../models/UserModel");
const Favorite = require("../models/FavoriteModel");
const bcrypt = require("bcrypt");
const fs = require("fs");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");

class UserController {
  async getAllUsers(req, res) {
    const user = new User();
    const { search } = req.query;
    if (search) {
      user.searchUsers(search).then((result) => {
        return res.status(200).send(result);
      });
    } else {
      user
        .getAllUsers()
        .then((result) => {
          return res.status(200).send(result);
        })
        .catch((err) => {
          return res.status(500).send({ status: 500, message: err.message });
        });
    }
  }

  async getUserById(req, res) {
    const { id } = req.params;
    const user = new User();
    user
      .find(id)
      .then((result) => {
        res.status(200).send({
          user_id: result.user_id,
          login: result.login,
          full_name: result.full_name,
          email: result.email,
          profile_picture: result.profile_picture,
          rating: result.rating,
          role: result.role,
        });
      })
      .catch(() => {
        res.status(404).send({ status: 404, message: "User not found!" });
      });
  }

  async getUserByLogin(req, res) {
    const { login } = req.params;
    const user = new User();
    user
      .findByLogin(login)
      .then((result) => {
        res.status(200).send({
          user_id: result[0].user_id,
          login: result[0].login,
          full_name: result[0].full_name,
          email: result[0].email,
          profile_picture: result[0].profile_picture,
          rating: result[0].rating,
          role: result[0].role,
        });
      })
      .catch(() => {
        res.status(404).send({ status: 404, message: "User not found!" });
      });
  }

  async createUser(req, res) {
    const { login, password, full_name, email, profile_picture, rating, role } =
      req.body;

    if (
      !login &&
      !password &&
      !full_name &&
      !email &&
      !profile_picture &&
      !rating &&
      !role
    ) {
      return res
        .status(400)
        .send({ status: 400, message: "You must fill all fields!" });
    }
    const user = new User(
      login,
      password,
      full_name,
      email,
      profile_picture,
      rating,
      role
    );
    const checkUserUnique = new User();

    const loginUnique = await checkUserUnique.isLoginUnique(login);
    const emailUnique = await checkUserUnique.isEmailUnique(email);

    if (loginUnique && emailUnique) {
      try {
        user.password = await bcrypt.hash(user.password, 10);
        user.save();
        res.status(200).send({
          status: 200,
          message: "User added successfully!",
        });
      } catch (err) {
        res.status(400).send({
          status: 400,
          message: "Something went wrong while saving user!",
        });
      }
    } else {
      res
        .status(400)
        .send({ status: 400, message: "Login or email already exists!" });
    }
  }

  async getUserAvatar(req, res) {
    const avatar = req.url.split("/")[2];
    const login = avatar.split(".")[0];
    const loginCheck = new User();
    loginCheck.findByLogin(login).then((results) => {
      if (results.length === 0) {
        return res.status(404).send("User not found");
      } else {
        const filePath = process.cwd() + "/images/avatars/" + avatar;
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            defaultFilePath = process.cwd() + "/images/default.jpg";
            fs.copyFile(defaultFilePath, filePath, (err) => {
              if (err) {
                return res.status(500).send("Error copying file");
              } else {
                return res.status(200).sendFile(filePath);
              }
            });
          } else {
            return res.status(200).sendFile(filePath);
          }
        });
      }
    });
  }

  async updateUserAvatar(req, res) {
    if (req.files === undefined || req.files === null)
      return res.status(400).send({ status: 400, message: "No file uploaded" });
    const { image } = req.files;
    const { login } = req.body;

    if (!image)
      return res.status(400).send({ status: 400, message: "No file uploaded" });

    if (!/^image/.test(image.mimetype))
      return res.send({ status: 415, message: "Only images allowed" });

    let size = 500;
    const path = process.cwd() + `/images/avatars/${login}.jpg`;
    const user = new User();
    user.findByLogin(login).then(() => {
      user.profile_picture = `${login}.jpg`;
      user.save();
    });
    sharp(image.data)
      .metadata()
      .then((metadata) => {
        if (metadata.width > metadata.height) {
          size = metadata.height;
        } else {
          size = metadata.width;
        }
        sharp(image.data)
          .resize({
            width: size,
            height: size,
            fit: "cover",
            position: "center",
          })
          .toFormat("jpg")
          .toFile(path, (err) => {
            if (err) {
              return res
                .status(400)
                .send({ status: 400, message: "Error uploading file" });
            }
            return res.status(200).send({
              status: 200,
              message: "File uploaded successfully",
            });
          });
      });
  }

  async updateUserData(req, res) {
    const { id } = req.params;
    const { login, password, full_name, email, profile_picture, rating, role } =
      req.body;
    const user = new User();
    user
      .find(id)
      .then(async (result) => {
        if (result.user_id) {
          user.user_id = result.user_id;
          user.login = login ? login : result.login;
          user.password = password
            ? await bcrypt.hash(password, 10)
            : result.password;
          user.full_name = full_name ? full_name : result.full_name;
          user.email = email ? email : result.email;
          user.profile_picture = profile_picture
            ? profile_picture
            : result.profile_picture;
          user.rating = rating ? rating : result.rating;
          user.role = role ? role : result.role;
          await user.save();
          res
            .status(200)
            .send({ status: 200, message: "User updated successfully!" });
        } else {
          res.status(400).send({ status: 400, message: "User not found!" });
        }
      })
      .catch(() => {
        res.status(400).send({ status: 400, message: "User not found!" });
      });
  }

  async deleteUser(req, res) {
    const { id } = req.params;
    try {
      const user = new User();
      user
        .find(id)
        .then(() => {
          if (user.role !== "admin") {
            res.cookie("token", "");
          }
          user.delete(id);
          res
            .status(200)
            .send({ status: 200, message: "User deleted successfully!" });
        })
        .catch(() => {
          res
            .status(404)
            .send({ status: 404, message: "User does not exist!" });
        });
    } catch (err) {
      res.status.send({ status: 400, message: err.message });
    }
  }

  async getFavoritePosts(req, res) {
    const { id } = req.params;
    const favorites = new Favorite();
    favorites
      .findFavoritePosts(id)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(() => {
        res.status(404).send({ status: 404, message: "User does not exist!" });
      });
  }

  async addFavoritePost(req, res) {
    const { id } = req.params;
    const decoded = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
    try {
      console.log(decoded);
      const user = new User();
      await user.findByLogin(decoded.login);
      const favorite = new Favorite();
      console.log(id, user.user_id);
      await favorite.saveFavorite(id, user.user_id);
      res
        .status(200)
        .send({ status: 200, message: "Post added to favorites!" });
    } catch (err) {
      res.status(500).send({ status: 500, message: err.message });
    }
  }

  async deleteFavoritePost(req, res) {
    const { id } = req.params;
    const decoded = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);

    try {
      const user = new User();
      await user.findByLogin(decoded.login);
      const favorite = new Favorite();
      const result = await favorite.deleteFavoritePost(id, user.user_id);

      res.status(200).send(result);
    } catch (err) {
      res.status(500).send({ status: 500, message: err.message });
    }
  }
}

module.exports = new UserController();
