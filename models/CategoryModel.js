const Model = require("./model.js");
const db = require("./db");

class Category extends Model {
  constructor(title = "", description = "") {
    super();
    this.category_id = 0;
    this.title = title;
    this.description = description;
  }

  async find(category_id) {
    const results = await super.find(category_id, "categories", "category_id");
    this.category_id = results[0].category_id;
    this.title = results[0].title;
    this.description = results[0].description;
    return results[0];
  }

  async findByTitle(title) {
    const selectQ = `SELECT * FROM categories WHERE title='${title}'`;
    try {
      const results = await db.query(selectQ);
      if (results[0].length) {
        const categoryResult = results[0][0];
        this.category_id = categoryResult.category_id;
        this.title = categoryResult.title;
        this.description = categoryResult.description;
      }
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async isCategoryUnique(title) {
    const existingCategory = await this.findByTitle(title);
    return !existingCategory.length ? true : false;
  }

  async getPostsByCategory(category_id, limit, offset) {
    const selectQ = `SELECT posts.* FROM posts RIGHT JOIN post_categories ON posts.post_id = post_categories.post_id WHERE post_categories.category_id=${category_id} LIMIT ${limit} OFFSET ${offset};`;
    try {
      const results = await db.query(selectQ);
      return results[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllCategories() {
    const results = await super.getAllData("categories");
    return results;
  }

  delete(category_id) {
    super.delete(category_id, "categories", "category_id");
  }

  save() {
    super.save(this, "categories", "category_id");
  }
}

module.exports = Category;
