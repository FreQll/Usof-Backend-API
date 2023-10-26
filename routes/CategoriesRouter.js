const express = require("express");
const router = express.Router();
const CategoriesController = require("../controllers/CategoriesController");

router.get("/", CategoriesController.getAllCategories);
router.get("/:id", CategoriesController.getCategoryById);
router.get("/:id/posts", CategoriesController.getPostsByCategoryId);
router.post("/", CategoriesController.createCategory);
router.patch("/:id", CategoriesController.updateCategory);
router.delete("/:id", CategoriesController.deleteCategory);

module.exports = router;
