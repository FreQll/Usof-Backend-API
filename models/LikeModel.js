const Model = require("./model.js");
const db = require("./db.js");

class Like extends Model {
  constructor(post_id = 0, user_id = 0, comment_id = 0, type = "like") {
    super();
    this.like_id = 0;
    this.post_id = post_id;
    this.user_id = user_id;
    this.comment_id = comment_id;
    this.type = type;
    this.publish_date = new Date();
  }

  async find(like_id) {
    const results = await super.find(like_id, "likes", "like_id");
    this.like_id = results[0].like_id;
    this.post_id = results[0].post_id;
    this.user_id = results[0].user_id;
    this.comment_id = results[0].comment_id;
    this.type = results[0].type;
    this.publish_date = results[0].publish_date;
    return results[0];
  }

  async findPostLike(user_id, post_id) {
    const selectQ = `SELECT * FROM likes WHERE user_id = ${user_id} AND post_id = ${post_id};`;
    try {
      const results = await db.query(selectQ, [user_id, post_id]);
      if (results.length > 0) {
        return results;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  async findCommentLike(user_id, comment_id) {
    const selectQ = `SELECT * FROM likes WHERE user_id = ${user_id} AND comment_id = ${comment_id};`;
    try {
      const results = await db.query(selectQ);
      if (results[0].length > 0) {
        return results;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  async calculateRatingUnderPost(post_id) {
    const selectQ = `SELECT
    SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) AS likes,
    SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) AS dislikes,
    (SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) - SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END)) AS rating
    FROM
      likes
    WHERE
      post_id = ${post_id};`;

    try {
      const results = await db.query(selectQ);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async calculateRatingUnderComment(comment_id) {
    const selectQ = `SELECT
    SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) AS likes,
    SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END) AS dislikes,
    (SUM(CASE WHEN type = 'like' THEN 1 ELSE 0 END) - SUM(CASE WHEN type = 'dislike' THEN 1 ELSE 0 END)) AS rating
    FROM
      likes
    WHERE
      comment_id = ${comment_id};`;

    try {
      const results = await db.query(selectQ);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async calculateUserRating(user_id) {
    const selectQ = `SELECT
    user_id,
    SUM(rating) AS total_rating
    FROM (
        SELECT
            p.author_id AS user_id,
            p.rating
        FROM posts p
        WHERE p.author_id = ${user_id}

        UNION ALL

        SELECT
            c.author_id AS user_id,
            c.rating
        FROM comments c
        WHERE c.author_id = ${user_id}
    ) AS user_activity
    GROUP BY user_id;`;

    try {
      const results = await db.query(selectQ);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  delete(like_id) {
    super.delete(like_id, "likes", "like_id");
  }

  save() {
    super.save(this, "likes", "like_id");
  }
}

module.exports = Like;
