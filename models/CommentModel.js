const Model = require("./model.js");
const db = require("./db.js");

class Comment extends Model {
  constructor(author_id = 0, post_id = 0, content = "") {
    super();
    this.comment_id = 0;
    this.author_id = author_id;
    this.post_id = post_id;
    this.publish_date = new Date();
    this.content = content;
    this.rating = 0;
  }

  async find(comment_id) {
    const results = await super.find(comment_id, "comments", "comment_id");
    this.comment_id = results[0].comment_id;
    this.author_id = results[0].author_id;
    this.post_id = results[0].post_id;
    this.publish_date = results[0].publish_date;
    this.content = results[0].content;
    this.rating = results[0].rating;
    return results[0];
  }

  async getAllLikesForComment(comment_id) {
    const selectQ = `
    SELECT *
    FROM likes
    WHERE comment_id = ${comment_id};
  `;

    try {
      const results = await db.query(selectQ);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  delete(comment_id) {
    super.delete(comment_id, "comments", "comment_id");
  }

  save() {
    super.save(this, "comments", "comment_id");
  }
}

module.exports = Comment;
