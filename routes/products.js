const Product = require("../models/product");
const { Category } = require("../models/category");
const ObjectId = require("mongoose").Types.ObjectId;

const express = require("express");
const router = express.Router();
router.get(`/featured/:count?`, async (req, res) => {
  const count = req.params.count || 0;

  try {
    const featuredProducts = await Product.find({ isFeatured: true }).limit(
      +count
    );

    if (!featuredProducts) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to get featured Products." });
    }

    res.status(200).json({ featuredProducts: featuredProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.get(`/count`, async (req, res) => {
  try {
    const productCount = await Product.countDocuments();

    if (!productCount) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to count products." });
    }

    res.status(200).json({ productCount: productCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get(`/`, async (req, res) => {
  let productList = [];

  if (req.query.categories) {
    const categories = req.query.categories.split(",");
    for (const categoryId of categories) {
      if (!ObjectId.isValid(categoryId)) {
        return res.status(404).json({ message: "Invalid category" });
      }
    }
    productList = await Product.find({ category: { $in: categories } });
  } else {
    productList = await Product.find();
  }

  if (!productList) {
    return res.status(500).json({ success: false });
  }

  res.send(productList);
});

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res
      .status(404)
      .json({ success: false, messege: "product was unable to find." });
  }
  res.send(product);
});
router.post(`/`, (req, res) => {
  Category.findById(req.body.category).then((category) => {
    if (!category) return res.status(400).send("Invalid category");
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      images: req.body.images,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    product
      .save()
      .then((createdProduct) => {
        res.status(201).json(createdProduct);
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
          success: false,
        });
      });
  });
});
router.put("/:id", async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid category");
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Invalid Product.");

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.image = req.body.image || product.image;
    product.price = req.body.price || product.price;

    product.images = req.body.images || product.images;
    product.category = req.body.category || product.category;
    product.countInStock = req.body.countInStock || product.countInStock;
    product.numReviews = req.body.numReviews || product.numReviews;
    product.isFeatured = req.body.isFeatured || product.isFeatured;
    const updatedProduct = await product.save();
    res.status(200).json({ sucess: true, updatedProduct: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.delete(`/:id`, async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (!deletedProduct) return res.status(500).send("Product cannot deleted!");
  res.status(200).send("Product was deleted");
});

module.exports = router;
