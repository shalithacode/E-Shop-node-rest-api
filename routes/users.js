const User = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv/config");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User does not exist",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid password",
    });
  }
  var token = jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    process.env.SECRET,
    {
      expiresIn: "1d",
    }
  );

  return res.status(200).json({
    success: true,
    message: "User authenticated",
    user: user.name,
    token: token,
  });
});

router.get(`/`, async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");

    if (userList.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }

    return res.status(200).json({ success: true, users: userList });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});
router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res
      .status(404)
      .json({ success: false, messege: "user was unable to find." });
  }
  res.send(user);
});
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    } = req.body;
    const user = await User.find({ email: email });
    if (user.length > 0)
      return res.status(400).json({
        success: false,
        message: "User already exsist",
      });
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      passwordHash,
      phone,
      isAdmin,
      street,
      apartment,
      zip,
      city,
      country,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: savedUser.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
