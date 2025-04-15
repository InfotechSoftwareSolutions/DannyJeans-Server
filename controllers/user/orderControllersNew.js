import mongoose from "mongoose";
import axios from "axios";
import { Order } from "../models/orderModel";
import { User } from "../models/userModel";
import { Product } from "../models/productModel";
import { getAuthToken } from "../utils/shiprocketAuth";

export const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { user, orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

        if (!user || !orderItems.length || !shippingAddress || !paymentMethod || !totalPrice) {
            return res.status(400).json({ message: "Invalid order data" });
        }

        // Fetch user details using aggregation
        const userDetails = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(user) } },
            { $project: { name: 1, email: 1, phone: 1 } }
        ]);

        if (!userDetails.length) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch product details using aggregation
        const productIds = orderItems.map(item => new mongoose.Types.ObjectId(item.product));
        const productDetails = await Product.aggregate([
            { $match: { _id: { $in: productIds } } },
            { $project: { name: 1, price: 1 } }
        ]);

        if (!productDetails.length) {
            return res.status(404).json({ message: "Some products not found" });
        }

        // Map order items with product details
        const updatedOrderItems = orderItems.map(item => {
            const product = productDetails.find(p => p._id.toString() === item.product.toString());
            return {
                product: item.product,
                name: product ? product.name : "Unknown Product",
                quantity: item.quantity,
                price: product ? product.price : 0
            };
        });

        // Create new order
        const newOrder = new Order({
            user,
            orderItems: updatedOrderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            deliveryStatus: "Pending",
        });

        await newOrder.save({ session });

        console.log(`Order ${newOrder._id} created successfully in MongoDB.`);

        // Authenticate with Shiprocket
        const token = await getAuthToken();
        if (!token) {
            await session.abortTransaction();
            return res.status(500).json({ message: "Shiprocket Authentication Failed" });
        }

        // Prepare Shiprocket Order Data
        const shiprocketOrderData = {
            order_id: newOrder._id.toString(),
            order_date: new Date().toISOString(),
            pickup_location: "Primary",
            billing_customer_name: userDetails[0].name,
            billing_address: shippingAddress.street,
            billing_city: shippingAddress.city,
            billing_pincode: shippingAddress.zip,
            billing_state: shippingAddress.state,
            billing_country: shippingAddress.country,
            billing_email: userDetails[0].email,
            billing_phone: userDetails[0].phone,
            order_items: updatedOrderItems.map(item => ({
                name: item.name,
                sku: item.product.toString(),
                units: item.quantity,
                selling_price: item.price,
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
            `${process.env.SHIPROCKET_API_URL}/orders/create/adhoc`,
            shiprocketOrderData,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (shiprocketResponse.data && shiprocketResponse.data.shipment_id) {
            newOrder.shipment_id = shiprocketResponse.data.shipment_id;
            newOrder.awb_code = shiprocketResponse.data.awb_code;
            newOrder.courier_name = shiprocketResponse.data.courier_name;
            newOrder.deliveryStatus = "Processing";

            await newOrder.save({ session });
            console.log(`Order ${newOrder._id} successfully pushed to Shiprocket.`);
        } else {
            console.error("Shiprocket response error:", shiprocketResponse.data);
            await session.abortTransaction();
            return res.status(500).json({ message: "Failed to create shipment in Shiprocket" });
        }

        await session.commitTransaction();
        res.status(201).json({ message: "Order created successfully", order: newOrder });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Order creation failed" });
    } finally {
        session.endSession();
    }
};
