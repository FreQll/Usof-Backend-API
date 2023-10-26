const Model = require("./model.js");
const db = require("./db.js");

class User extends Model {
  constructor(
    login = "",
    password = "",
    full_name = "",
    email = "",
    profile_picture = "default.jpg",
    rating = 0,
    role = "user"
  ) {
    super();
    this.user_id = 0;
    this.login = login;
    this.password = password;
    this.full_name = full_name;
    this.email = email;
    this.profile_picture = profile_picture;
    this.rating = rating;
    this.role = role;
  }

  async find(user_id) {
    const results = await super.find(user_id, "users", "user_id");
    if (results.length) {
      this.user_id = results[0].user_id;
      this.login = results[0].login;
      this.password = results[0].password;
      this.full_name = results[0].full_name;
      this.email = results[0].email;
      this.profile_picture = results[0].profile_picture;
      this.rating = results[0].rating;
      this.role = results[0].role;
    }
    return results[0];
  }

  async getAllUsers() {
    const selectQuery = `SELECT user_id, login, full_name, email, profile_picture, rating, role FROM users`;
    try {
        const results = await db.query(selectQuery);
        return results[0];
    } catch (error) {
        throw error;
    }
  }

  async findByLogin(login) {
    const selectQ = `SELECT * FROM users WHERE login='${login}'`;
    try {
      const results = await db.query(selectQ);
      if (results[0].length) {
        const userResult = results[0][0];
        this.user_id = userResult.user_id;
        this.login = userResult.login;
        this.password = userResult.password;
        this.full_name = userResult.full_name;
        this.email = userResult.email;
        this.profile_picture = userResult.profile_picture;
        this.rating = userResult.rating;
        this.role = userResult.role;
      }
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async searchUsers(searchQuery) {
    const selectQ = `
      SELECT user_id, login, full_name, email, profile_picture, rating, role
      FROM users
      WHERE 
        login LIKE '%${searchQuery}%';
    `;
  
    try {
      const results = await db.query(selectQ);
      return results[0];
    } catch (error) {
      throw error;
    }
  }
  

  async findByEmail(email) {
    const selectQ = `SELECT * FROM users WHERE email='${email}'`;
    try {
      const results = await db.query(selectQ);
      if (results[0].length) {
        const userResult = results[0][0];
        this.user_id = userResult.user_id;
        this.login = userResult.login;
        this.password = userResult.password;
        this.full_name = userResult.full_name;
        this.email = userResult.email;
        this.profile_picture = userResult.profile_picture;
        this.rating = userResult.rating;
        this.role = userResult.role;
      }
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async isLoginUnique(login) {
    const existingUser = await this.findByLogin(login);
    return !existingUser.length ? true : false;
  }

  async isEmailUnique(email) {
    const existingUser = await this.findByEmail(email);
    return !existingUser.length ? true : false;
  }

  delete(user_id) {
    super.delete(user_id, "users", "user_id");
  }

  save() {
    super.save(this, "users", "user_id");
  }
}

module.exports = User;
