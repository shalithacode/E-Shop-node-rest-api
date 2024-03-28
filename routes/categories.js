const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.send(categoryList);
});
router.get(`/:id`, async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res
      .status(404)
      .json({ success: false, messege: "Category was unable to find." });
  }
  res.send(category);
});
router.post(`/`, async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  const savedCategory = await category.save();

  if (!savedCategory) return res.status(500).send("Category cannot creaed!");
  res
    .status(201)
    .json({ messege: "Category was created", category: savedCategory });
});
router.put(`/:id`, async (req, res) => {
  const category = await Category.findById(req.params.id);
  try {
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    category.name = req.body.name || category.name;
    category.icon = req.body.icon || category.icon;
    category.color = req.body.color || category.color;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.delete(`/:id`, async (req, res) => {
  const deletedCategory = await Category.findByIdAndDelete(req.params.id);

  if (!deletedCategory) return res.status(500).send("Category cannot deleted!");
  res.status(200).send("Category was deleted");
});
module.exports = router;
