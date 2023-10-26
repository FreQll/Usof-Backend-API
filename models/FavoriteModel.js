const Model = require("./model.js");
const db = require("./db.js");

class Favorite extends Model {
  constructor(post_id = 0, user_id = 0) {
    super();
    this.post_id = post_id;
    this.user_id = user_id;
  }

  async find(user_id) {
    const results = await super.find(user_id, "favorite_posts", "user_id");
    this.post_id = results[0].post_id;
    this.user_id = results[0].user_id;
    return results[0];
  }

  async findFavoritePosts(user_id) {
    const selectQ = `SELECT p.*
    FROM favorite_posts AS f
    JOIN posts AS p ON f.post_id = p.post_id
    WHERE f.user_id = ${user_id};`;
    try {
      const results = await db.query(selectQ);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async saveFavorite(post_id, user_id) {
    const checkQuery = `SELECT * FROM favorite_posts WHERE post_id = ${post_id} AND user_id = ${user_id};`;
    const checkResults = await db.query(checkQuery);

    if (checkResults[0].length === 0) {
      const insertQuery = `INSERT INTO favorite_posts (post_id, user_id) VALUES (${post_id}, ${user_id});`;
      try {
        const results = await db.query(insertQuery);
        return results;
      } catch (error) {
        throw error;
      }
    } else {
      throw new Error("This post is already in favorites.");
    }
  }

  async deleteFavoritePost(post_id, user_id) {
    const deleteQuery = `DELETE FROM favorite_posts WHERE post_id = ${post_id} AND user_id = ${user_id};`;

    try {
      const results = await db.query(deleteQuery);
      if (results[0].affectedRows > 0) {
        return { status: 200, message: "Post removed from favorites." };
      } else {
        return { status: 404, message: "Post not found in favorites." };
      }
    } catch (error) {
      throw error;
    }
  }

  delete(category_id) {
    super.delete(category_id, "categories", "category_id");
  }

  save() {
    super.save(this, "categories", "category_id");
  }
}

module.exports = Favorite;
