import crypto from "crypto";
import express from "express";

const router = express.Router();

router.post("/webhook", express.json({ type: "application/json" }), (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const receivedSignature = req.headers["x-razorpay-signature"];
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (generatedSignature === receivedSignature) {
    console.log("Webhook verified:", req.body);
    // Handle different event types (e.g., "payment.captured")
  } else {
    console.log("Webhook signature mismatch");
    return res.status(400).send("Invalid signature");
  }

  res.status(200).json({ status: "ok" });
});

export default router;
