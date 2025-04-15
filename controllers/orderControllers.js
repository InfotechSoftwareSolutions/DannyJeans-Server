const axios = require("axios");
const mongoose = require("mongoose");

const { User } = require("../models/userModel.js");
const { Order } = require("../models/orderModel.js");
const razorpay = require("../utils/razorpay.js"); // Import Razorpay instance
//temp
const { getAuthToken } = require("../utils/shiprocketToken.js");
const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external"; // Ensure this is in your .env

// ****************************************
// Helper function to get last 7 days' dates
const getLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]); // YYYY-MM-DD format
  }
  return dates;
};
// ***********************************

// ✅ Check cart availability using aggregation
const isproductAvailabe = async (req, res) => {
  try {
    const userId = req.userId;

    // Handle missing userId in params
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // 🔹 Aggregation pipeline
    const userCart = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$cart" }, // Unwind cart array
      {
        $lookup: {
          from: "products", // Match with Product collection
          localField: "cart.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // Unwind product details
      {
        $project: {
          _id: 0,
          productId: "$productDetails._id",
          name: "$productDetails.name",
          availableStock: "$productDetails.stock",
          requestedQuantity: "$cart.quantity",
        },
      },
      {
        $match: {
          $expr: { $lt: ["$availableStock", "$requestedQuantity"] }, // Filter out-of-stock items
        },
      },
    ]);

    if (userCart.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some products are out of stock",
        unavailableProducts: userCart,
      });
    }

    res
      .status(200)
      .json({ success: true, message: "All products are available" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Server error", error });
  }
};

const getAllOrder = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find()
      .populate("user", "name phone") // Populate user fields (adjust as needed)
      .populate("orderItems.product", "name sale_price images"); // Populate product fields

    // Validation: Check if orders exist
    if (!orders) {
      return res.status(400).json({
        success: false,
        message: "No orders found. Please place an order first.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully.",
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the orders.",
      error: error.message,
    });
  }
};

//🆕 Create Order and Push to Shiprocket
const createOrder = async (req, res) => {
  // const validPaymentMethods = ["COD", "Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet"];

  try {
    const userId = req.userId;

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      currency = "INR",
    } = req.body;

    console.log("createOrders start");

    console.log(orderItems,"orderItems")
    console.log(shippingAddress,"shippingAddress")
    console.log(paymentMethod,"paymentMethod")
    console.log(currency,"currency")

    // Validate request data
    if (
      Object.keys(orderItems).length === 0||
      Object.keys(shippingAddress).length === 0 ||
      !paymentMethod 
    ) {
      return res.status(400).json({ message: "Invalid order data" });
    }


    //  return;

    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ message: "Invalid user ID." });
    // }

    //calculate Totalprice
    let totalPrice = orderItems.product.sale_price * orderItems.quantity;

    // Step 1: Create a new order in MongoDB
    const newOrder = await Order.create({
      user: userId,
      orderItems: {
        product: orderItems.product._id,
        quantity: orderItems.quantity,
      },
      shippingAddress: {
        fullName: shippingAddress?.fullName,
        phone: shippingAddress?.phone,
        street: shippingAddress?.street,
        city: shippingAddress?.city,
        state: shippingAddress?.state,
        zip: shippingAddress?.zip,
        country: shippingAddress?.country,
      },
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      deliveryStatus: "Pending",
    });

    if (!newOrder) {
      res
        .status(500)
        .json({ message: "Order creation failed. Please try again later" });
    }

    let razorpayOrder = null;

    // Step 2: Handle Payment
    if (paymentMethod !== "COD") {
      const options = {
        amount: totalPrice * 100, // Convert to paise
        currency,
        receipt: `receipt_${newOrder._id}`,
      };

      razorpayOrder = await razorpay.orders.create(options);
      if (!razorpayOrder) {
        return res
          .status(500)
          .json({ message: "Razorpay order creation failed" });
      }

      newOrder.razorpay_order_id = razorpayOrder.id;
      await newOrder.save();
      // console.log(`Razorpay Order ${razorpayOrder.id} created.`);
    }

    res.status(201).json({
      success: true,
      paymentMethod,
      message: "Order created successfully",
      order: newOrder,
      razorpayOrder: razorpayOrder ? razorpayOrder : null,
    });
  } catch (error) {
    // console.log(error,"errorsss")
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    console.log("getAllOrdersByUser1")
      const  userId = req.userId;
      // Handle missing orderId in params
      if (!userId) {
        return res.status(400).json({ message: "User id is required" });
      }

      if (!userId) {
          return res.status(400).json({
              success: false,
              message: "User ID is required.",
          });
      }

      const orders = await Order.find({ user: userId }).populate("orderItems.product", "name sale_price images");;
      console.log("orders",orders)

      // Validation: Check if the user has any orders
      if (!orders) {
          return res.status(404).json({
              success: false,
              message: "No orders found for this user.",
          });
      }

      res.status(200).json({
          success: true,
          message: "Orders retrieved successfully.",
          orders
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: "An error occurred while retrieving the orders.",
          error: error.message,
      });
  }
};

// API to get order count for the last 7 days
// router.get("/weekly-orders", async (req, res) => {
const orderForGraph = async (req, res) => {
  try {
      const last7Days = getLast7Days();
      const orders = await Order.aggregate([
          {
              $match: {
                  createdAt: { $gte: new Date(last7Days[0] + "T00:00:00.000Z") },
              },
          },
          {
              $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  count: { $sum: 1 },
              },
          },
      ]);

      // Convert MongoDB response into an object { "2025-03-21": 5, ... }
      const orderMap = {};
      orders.forEach((order) => {
          orderMap[order._id] = order.count;
      });

      // Map to last 7 days format
      const data = last7Days.map((date) => orderMap[date] || 0);

      res.json({ labels: last7Days, data });
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
};


// ********************************
// API to get total sales by category
// router.get("/sales-by-category", async (req, res) => {
const salesByCategory = async (req, res) => {
  try {
      const salesByCategory = await Order.aggregate([
          { $unwind: "$orderItems" }, // Flatten order items
          {
              $lookup: {
                  from: "products", // Match with Product collection
                  localField: "orderItems.product",
                  foreignField: "_id",
                  as: "productDetails",
              },
          },
          { $unwind: "$productDetails" },
          {
              $lookup: {
                  from: "categories", // Match with Category collection
                  localField: "productDetails.category",
                  foreignField: "_id",
                  as: "categoryDetails",
              },
          },
          { $unwind: "$categoryDetails" },
          {
              $group: {
                  _id: "$categoryDetails.name", // Group by category name
                  totalSales: { $sum: "$orderItems.quantity" }, // Sum quantity sold
              },
          },
          { $sort: { totalSales: -1 } }, // Sort by highest sales
      ]);

      // Format response
      const labels = salesByCategory.map((item) => item._id);
      const data = salesByCategory.map((item) => item.totalSales);
console.log(labels,"===labels");
console.log(data,"==data");

      res.json({ labels, data });
  } catch (error) {
      console.error("Error fetching sales by category:", error);
      res.status(500).json({ error: "Server error" });
  }
};

const orderStatusUpdate = async (req, res) => {
  try {
    console.log("orderStatusUpdate");
    console.log(req.params,req.body);

  const { orderId } = req.params;
  const { newStatus:deliveryStatus } = req.body;

console.log(orderId,deliveryStatus);

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }
  if (!deliveryStatus) {
    return res.status(400).json({ message: "Delivery status is required" });
  }

  const validStatuses = [
    "Pending", "Processing", "Shipped", "Out for Delivery",
    "Delivered", "Cancelled", "Returned", "Failed Delivery"
  ];


    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Validate delivery status
    if (!validStatuses.includes(deliveryStatus)) {
      return res.status(400).json({ message: "Invalid delivery status" });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the status is being updated to "Returned"
    if (deliveryStatus === "Returned") {
      if (!order.deliveredAt) {
        return res.status(400).json({ message: "Order has not been delivered yet" });
      }

      // Calculate the difference between today and deliveredAt
      const deliveredDate = new Date(order.deliveredAt);
      const currentDate = new Date();
      const diffInDays = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24));

      if (diffInDays > 7) {
        return res.status(400).json({ message: "Return period has expired (7 days limit)" });
      }
    }

    // Update delivery status
    order.deliveryStatus = deliveryStatus;

    // If status is "Delivered", set deliveredAt timestamp
    if (deliveryStatus === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({success: true, message: "Delivery status updated successfully", order });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ******************************************
const  processReturn = async (productId, returnReason, color, size, qty)=> {
  try {
    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // If the reason is "Item is defective", do not restock
    if (returnReason === "Item is defective") {
      return { success: true, message: "Return processed, but stock not updated due to defect." };
    }

    // Find the matching color variant
    const colorVariant = product.varient.find(v => v.colour_varient === color);
    if (!colorVariant) {
      throw new Error("Color variant not found");
    }

    // Find the matching size variant
    const sizeVariant = colorVariant.size_varient.find(s => s.size === size);
    if (!sizeVariant) {
      throw new Error("Size variant not found");
    }

    // Increase the stock quantity for the specific size
    sizeVariant.qty += qty;
    product.stock += qty; // Also update total stock

    // Save the updated product
    await product.save();

    return { success: true, message: "Return processed and stock updated successfully." };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  createOrder,
  isproductAvailabe,
  getAllOrder,
  getAllOrdersByUser,
  orderForGraph,
  salesByCategory,
  orderStatusUpdate,
  processReturn
};
