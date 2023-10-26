const Model = require("./model");
const db = require("./db");

class Post extends Model {
  constructor(title = "", content = "", author_id = 0) {
    super();
    this.post_id = 0;
    this.author_id = author_id;
    this.publish_date = new Date();
    this.title = title;
    this.content = content;
    this.rating = 0;
    this.status = "active";
  }

  async find(post_id) {
    const results = await super.find(post_id, "posts", "post_id");
    if (results.length) {
      this.post_id = results[0].post_id;
      this.author_id = results[0].author_id;
      this.title = results[0].title;
      this.content = results[0].content;
      this.rating = results[0].rating;
      this.status = results[0].status;
    }
    return results[0];
  }

  async query(sql) {
    try {
      const results = await db.query(sql);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllPosts() {
    const results = await super.getAllData("posts");
    return results;
  }

  async getAllCommentsForPost(post_id) {
    const selectQ = `SELECT * FROM posts RIGHT JOIN comments ON posts.post_id = comments.post_id WHERE posts.post_id = ${post_id};`;
    try {
      const results = await db.query(selectQ);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllCategoriesForPost(post_id) {
    const selectQ = `SELECT categories.title, categories.description
                    FROM post_categories
                    JOIN categories ON post_categories.category_id = categories.category_id
                    WHERE post_categories.post_id = ${post_id};`;
    try {
      const results = await db.query(selectQ);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllLikesForPost(post_id) {
    const selectQ = `SELECT * FROM likes WHERE post_id=${post_id} AND comment_id IS NULL;`;
    try {
      const results = await db.query(selectQ);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async getLastPostId() {
    const selectQ = "SELECT MAX(post_id) AS lastPostId FROM posts";
    try {
      const results = await db.query(selectQ);
      return results[0][0].lastPostId;
    } catch (error) {
      throw error;
    }
  }

  delete(post_id) {
    super.delete(post_id, "posts", "post_id");
  }

  save() {
    super.save(this, "posts", "post_id");
  }

  async save_categories(postID, categoryID) {
    const query = `INSERT INTO post_categories (post_id, category_id) VALUES (${postID},${categoryID});`;
    try {
      const results = await db.query(query);
      return results;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Post;
