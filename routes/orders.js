const { OrderItem } = require("../models/Order-item");
const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();
router.get(`/income`, async (req, res) => {
  const totalIncome = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
      },
    },
  ]);

  if (totalIncome.length === 0) {
    return res
      .status(500)
      .json({ success: false, message: "No income data found" });
  }
  return res.send(totalIncome.pop());
});
router.get(`/count`, async (req, res) => {
  const orderCount = await Order.countDocuments();

  if (!orderCount) {
    return res.status(500).json({ success: false });
  }
  return res.status(200).json({ count: orderCount });
});
router.get(`/user/:id`, async (req, res) => {
  const orders = await Order.find({ user: req.params.id }).populate({
    path: "orderItems",
    populate: "product",
  });
  if (!orders) {
    res
      .status(404)
      .json({ success: false, messege: "orders was unable to find." });
  }
  res.send(orders);
});
router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("orderItems")
    .populate("user", "name")
    .sort({ updatedAt: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id).populate({
    path: "orderItems",
    populate: "product",
  });
  if (!order) {
    res
      .status(404)
      .json({ success: false, messege: "order was unable to find." });
  }
  res.send(order);
});
router.post(`/`, async (req, res) => {
  try {
    const orderItems = req.body.orderItems.map(async (orderItem) => {
      const item = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      const savedItem = await item.save();
      return savedItem._id;
    });
    const orderItemsIdsResolved = await Promise.all(orderItems);

    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          "product"
        );

        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      })
    );
    let order = new Order({
      orderItems: orderItemsIdsResolved,
      totalPrice: totalPrices.reduce((acc, curr) => acc + curr, 0),
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      user: req.body.user,
    });

    if (!order)
      return res
        .statusCode(404)
        .json({ success: "failed", message: "Order not found" });

    const savedOrder = await order.save();
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.put(`/:id`, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      category: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
router.delete(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).send("Category cannot found!");

  for (const orderItem of order.orderItems) {
    await OrderItem.findByIdAndDelete(orderItem._id);
  }

  const deletedOrder = await Order.findByIdAndDelete(req.params.id);

  if (!deletedOrder) return res.status(500).send("Category cannot deleted!");
  res.status(200).send("Order was deleted");
});

module.exports = router;
