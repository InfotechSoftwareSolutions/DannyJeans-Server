const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        orderItems: {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
        },
        shippingAddress: {
            fullName: String,
            phone: String,
            address: String,
            street: String,
            city: String,
            state: String,
            zip: String,
            country: String,

        },
        paymentMethod: { type: String, required: true },
        paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
        totalPrice: { type: Number, required: true },

        // Delivery Statuses
        deliveryStatus: {
            type: String,
            enum: [
                "Pending", "Processing", "Shipped", "Out for Delivery",
                "Delivered", "Cancelled", "Returned", "Failed Delivery",
            ],
            default: "Pending",
        },
        deliveredAt: { type: Date },

        // Shiprocket Integration Fields
        shipment_id: { type: String }, // Shiprocket Shipment ID
        awb_code: { type: String }, // Tracking Number
        courier_name: { type: String }, // Courier Partner
        courier_status: { type: String }, // Status from Shiprocket
    },
    { timestamps: true }
);

module.exports = {
    Order: mongoose.model("Order", orderSchema),
};
