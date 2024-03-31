const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const MONGODB_URI = `mongodb+srv://${process.env.MONOGDB_USER}:${process.env.MONOGDB_PASSWORD}@node-cluster.dkal6pa.mongodb.net/e-shop?retryWrites=true&w=majority`;
const authJwt = require("./helper/jwt");
const errorHandler = require("./helper/error-handler");

app.use(cors());
app.options("*", cors());

//middleware
app.use(bodyParser.json());
app.use(authJwt());

//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");

app.use("/category", categoriesRoutes);
app.use("/product", productsRoutes);
app.use("/user", usersRoutes);
app.use("/order", ordersRoutes);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((e) => console.log(e));
