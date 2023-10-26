const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const sendEmail = require("../controllers/nodemailer");
const config = require("../config.json");

const jwtGenerator = (id, email, login, role) => {
  return jwt.sign(
    { id: id, email: email, role: role, login: login },
    process.env.SECRET_KEY,
    {
      expiresIn: "2h",
    }
  );
};

class AuthController {
  async getWhoRegistered(req, res) {
    try {
      const decoded = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
      res.status(200).send({ login: decoded.login, role: decoded.role });
    } catch (err) {
      res.status(500).send({ status: 500, message: err.message });
    }
  }

  async register(req, res) {
    let { login, full_name, password, email } = req.body;
    if (!email || !password || !login || !full_name) {
      return res
        .status(400)
        .send({ status: 400, message: "Missing required parameters!" });
    }
    if (!/^[a-zA-Z0-9_,.\-]{1,20}$/.test(login)) {
      return res.status(400).send({
        status: 400,
        message:
          "Login is invalid. It must be 1 to 20 characters long and contain only allowed characters.",
      });
    }
    email = email.toLowerCase();
    password = await bcrypt.hash(password, 10);
    const checkUserUnique = new User();
    const loginUnique = await checkUserUnique.isLoginUnique(login);
    const emailUnique = await checkUserUnique.isEmailUnique(email);

    if (loginUnique && emailUnique) {
      const user = new User();
      user.login = login;
      user.password = password;
      user.email = email;
      user.full_name = full_name;
      user.save();
      user.token = jwtGenerator(user.id, user.email, user.login, user.role);
      res
        .status(200)
        .send({ status: 200, message: "Registration successful!" });
    } else {
      res.status(400).send({
        status: 400,
        message: "User with such login or email already exists!",
      });
    }
  }

  async login(req, res) {
    let { login, password } = req.body;
    const user = new User();
    user
      .findByLogin(login)
      .then(async (result) => {
        if (!result || !(await bcrypt.compare(password, result[0].password))) {
          return res
            .status(400)
            .send({ status: 400, message: "Invalid credentials" });
        } else {
          user.token = jwtGenerator(user.id, user.email, user.login, user.role);
          res.cookie("token", user.token);
          res.status(200).send({ status: 200, message: "Logged successfuly!" });
        }
      })
      .catch(() => {
        return res
          .status(400)
          .send({ status: 400, message: "Invalid credentials" });
      });
  }

  async logout(req, res) {
    try {
      res.cookie("token", "");
      res.status(200).send({ status: 200, message: "Logged out successfuly!" });
    } catch (err) {
      res.status(400).send({ status: 400, message: err.message });
    }
  }

  async resetPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .send({ status: 400, message: "Missing required parameters" });
    }

    const checkUserUnique = new User();
    const emailUnique = await checkUserUnique.isEmailUnique(email);
    if (emailUnique) {
      return res
        .status(404)
        .send({ status: 404, message: "User with such email does not exist" });
    }

    const user = new User();
    user.findByEmail(email).then(async (result) => {
      const secret = process.env.SECRET_KEY + user.password;
      const payload = {
        email: user.email,
        id: user.user_id,
      };
      const token = await jwt.sign(payload, secret, { expiresIn: "1h" });
      const link = `http://${config.host}:${config.port}/reset-password/${user.user_id}/${token}`;
      const message =
        "Here is your link to reset password, remember it is valid for 1 hour and can be used only once";
      await sendEmail(email, "Password Reset", message + "\n" + token);
      res.status(200).send({
        status: 200,
        message: "Email succesfully sended!",
        link: link,
      });
    });
  }

  async resetPasswordConfirm(req, res) {
    const { id, token } = req.params;
    const { password } = req.body;
    if (!password) {
      return res
        .status(400)
        .send({ status: 400, message: "Missing required parameters" });
    }
    const user = new User();
    user
      .find(id)
      .then(async (result) => {
        const secret = process.env.SECRET_KEY + result.password;
        try {
          const payload = await jwt.verify(token, secret);
          user.password = await bcrypt.hash(password, 10);
          user.save();
          res.status(200).send({ status: 200, message: "Password changed!" });
        } catch (err) {
          res.status(400).send({ status: 400, message: err.message });
        }
      })
      .catch((err) => {
        res.status(400).send({ status: 400, message: err.message });
      });
  }
}

module.exports = new AuthController();
