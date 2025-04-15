const { Courses } = require("../../models/courseModel");
const { Users } = require("../../models/usersModel");

import { Order } from "../../models/orderModel";
// import { getAuthToken } from "../services/shiprocketService.js";

// const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external";


import axios from "axios";
import Order from "../models/Order.js";
import { getAuthToken } from "../utils/shiprocketAuth.js"; // Assuming a separate utility for Shiprocket token handling

const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external"; // Ensure this is in your .env

// Create Order and Push to Shiprocket
export const createOrder = async (req, res) => {
    try {
        const { user, orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

        // Validate request data
        if (!user || !orderItems.length || !shippingAddress || !paymentMethod || !totalPrice) {
            return res.status(400).json({ message: "Invalid order data" });
        }

        // Create a new order in MongoDB
        const newOrder = new Order({
            user,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            deliveryStatus: "Pending",
        });

        await newOrder.save();
        console.log(`Order ${newOrder._id} created successfully in MongoDB.`);

        // Authenticate with Shiprocket
        const token = await getAuthToken();
        if (!token) {
            return res.status(500).json({ message: "Shiprocket Authentication Failed" });
        }

        // Prepare Shiprocket Order Data
        const shiprocketOrderData = {
            order_id: newOrder._id.toString(),
            order_date: new Date().toISOString(),
            pickup_location: "Primary",
            billing_customer_name: user.name,
            billing_address: shippingAddress.street,
            billing_city: shippingAddress.city,
            billing_pincode: shippingAddress.zip,
            billing_state: shippingAddress.state,
            billing_country: shippingAddress.country,
            billing_email: user.email,
            billing_phone: user.phone,
            order_items: orderItems.map(item => ({
                name: item.name || "Product Name", // Fetch product details dynamically if available
                sku: item.product.toString(),
                units: item.quantity,
                selling_price: totalPrice / orderItems.length, // Average per item
            })),
            payment_method: paymentMethod === "COD" ? "COD" : "Prepaid",
            shipping_is_billing: true,
            sub_total: totalPrice,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 1,
        };

        // Call Shiprocket API
        const shiprocketResponse = await axios.post(
            `${SHIPROCKET_API_URL}/orders/create/adhoc`,
            shiprocketOrderData,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (shiprocketResponse.data && shiprocketResponse.data.shipment_id) {
            // Update Order with Shiprocket details
            newOrder.shipment_id = shiprocketResponse.data.shipment_id;
            newOrder.awb_code = shiprocketResponse.data.awb_code;
            newOrder.courier_name = shiprocketResponse.data.courier_name;
            newOrder.deliveryStatus = "Processing";

            await newOrder.save();
            console.log(`Order ${newOrder._id} successfully pushed to Shiprocket.`);
        } else {
            console.error("Shiprocket response error:", shiprocketResponse.data);
            return res.status(500).json({ message: "Failed to create shipment in Shiprocket" });
        }

        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Order creation failed" });
    }
};



// const home = async (req, res, next) => {
// }

const trackOrder = async(req, res)=> {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);
        if (!order || !order.shipment_id) {
            return res.status(404).json({ message: "Order not found or not shipped" });
        }

        const token = await getAuthToken();
        if (!token) return res.status(500).json({ message: "Shiprocket Authentication Failed" });

        const response = await axios.get(
            `${SHIPROCKET_API_URL}/courier/track?order_id=${order.shipment_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Tracking Error:", error);
        res.status(500).json({ message: "Tracking failed" });
    }
}


const shiprocketWebhook = async (req, res)=>{
    try {
        console.log("Webhook Received:", req.body);

        const { order_id, status, awb_code, courier_name } = req.body;

        const order = await Order.findById(order_id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        order.deliveryStatus = status;
        order.awb_code = awb_code;
        order.courier_name = courier_name;

        if (status === "Delivered") order.deliveredAt = new Date();

        await order.save();
        res.status(200).send("Webhook processed successfully");
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Webhook processing failed" });
    }
}




module.exports = {
    createOrder,
    shiprocketWebhook
};