import crypto from "crypto";
import express from "express";
import Order from "../models/Order.js"; // Import Order model

const router = express.Router();

// router.post("/webhook", express.json({ type: "application/json" }), async (req, res) => {
router.post("/webhook", express.json({ type: "application/json" }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const receivedSignature = req.headers["x-razorpay-signature"];

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (generatedSignature !== receivedSignature) {
    console.log("Webhook signature mismatch");
    return res.status(400).send("Invalid signature");
  }

  console.log("Webhook verified:", req.body);

  const event = req.body.event;
  const payload = req.body.payload;

  try {
    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity);
        break;

      case "order.paid":
        await handleOrderPaid(payload.order.entity);
        break;

      case "refund.processed":
        await handleRefundProcessed(payload.refund.entity);
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ✅ Handle Successful Payment
async function handlePaymentCaptured(payment) {
    console.log("Payment Captured:", payment);
  
    const order = await Order.findOne({ orderId: payment.order_id });
    if (!order) {
      console.error("Order not found:", payment.order_id);
      return;
    }
  
    order.paymentId = payment.id;
    order.status = "Paid";
    await order.save();
  
    console.log(`Order ${order.orderId} marked as Paid`);
  
    // Send confirmation email (optional)
    // sendEmail(order.userEmail, "Payment Successful", "Your order has been paid.");
  }

  

// ❌ Handle Failed Payment
async function handlePaymentFailed(payment) {
    console.log("Payment Failed:", payment);
  
    const order = await Order.findOne({ orderId: payment.order_id });
    if (!order) {
      console.error("Order not found:", payment.order_id);
      return;
    }
  
    order.status = "Failed";
    await order.save();
  
    console.log(`Order ${order.orderId} marked as Failed`);
  
    // Notify user about failed payment (optional)
    // sendEmail(order.userEmail, "Payment Failed", "Your payment attempt was unsuccessful.");
  }

//   💰 Handle Order Paid
async function handleOrderPaid(order) {
    console.log("Order Paid:", order);
  
    const existingOrder = await Order.findOne({ orderId: order.id });
    if (!existingOrder) {
      console.error("Order not found:", order.id);
      return;
    }
  
    existingOrder.status = "Paid";
    await existingOrder.save();
  
    console.log(`Order ${existingOrder.orderId} confirmed as Paid`);
  }

  
//   🔄 Handle Refund Processed
async function handleRefundProcessed(refund) {
    console.log("Refund Processed:", refund);
  
    const order = await Order.findOne({ paymentId: refund.payment_id });
    if (!order) {
      console.error("Order not found for refund:", refund.payment_id);
      return;
    }
  
    order.status = "Refunded";
    await order.save();
  
    console.log(`Order ${order.orderId} marked as Refunded`);
  
    // Notify customer about refund (optional)
    // sendEmail(order.userEmail, "Refund Processed", "Your payment has been refunded.");
  }

  
