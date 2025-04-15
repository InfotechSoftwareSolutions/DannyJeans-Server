const mongoose = require("mongoose");
const { Address } = require("../models/addressModel");
const { User } = require("../models/userModel.js");

// ✅ Get All Addresses
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find();

        if (!addresses || addresses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No addresses found. Please add an address first.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Addresses retrieved successfully.",
            data: addresses,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the addresses.",
            error: error.message,
        });
    }
};

// ✅ Get Single Address
const getSingleAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await Address.findById(id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Address retrieved successfully.",
            data: address,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the address.",
            error: error.message,
        });
    }
};

// ✅ Add a New Address
const addAddress = async (req, res) => {
    try {

        const {   fullName, phone, street, city, state, zipCode:zip, country, address  } = req.body;
        console.log("addAddress");
           console.log(req.body);
        const userId = req.userId;

        console.log(userId,"userId");

        // Check if required fields are present
        if ( !fullName || !phone || !street || !city || !state || !zip || !country || !address) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        // Validate user ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        // Validate string fields
        const stringFields = { fullName, phone, street, city, state, zip, country, address };
        for (const [key, value] of Object.entries(stringFields)) {
            if (typeof value !== "string" || !value.trim()) {
                return res.status(400).json({ message: `Invalid type: ${key} must be a non-empty string.` });
            }
        }

        // Validate isDefault (optional)
        // if (isDefault !== undefined && typeof isDefault !== "boolean") {
        //     return res.status(400).json({ message: "Invalid type: isDefault must be a boolean." });
        // }

        // Proceed to the next middleware or controller logic
        // next();

        const newAddress = await Address.create({
            user : userId,
            fullName,
            phone,
            street,
            city,
            state,
            zip,
            country,
            address,
            isDefault: false,
        });

        if (!newAddress) {
            return res.status(400).json({
                success: false,
                message: "Address creation failed. Please try again.",
            });
        }

        res.status(201).json({
            success: true,
            message: "Address added successfully!",
            newAddress,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the address.",
            error: error.message,
        });
    }
};

// ✅ Update Address
const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, phone, street, city, state, zip, country, isDefault } = req.body;

        const address = await Address.findById(id);
        if (!address) return res.status(404).json({ message: "Address not found" });

        // Update fields if provided
        address.fullName = fullName || address.fullName;
        address.phone = phone || address.phone;
        address.street = street || address.street;
        address.city = city || address.city;
        address.state = state || address.state;
        address.zip = zip || address.zip;
        address.country = country || address.country;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        const updatedAddress = await address.save();

        if (!updatedAddress) {
            return res.status(400).json({
                success: false,
                message: "Address update failed. Please try again.",
            });
        }

        res.json({
            success: true,
            message: "Address updated successfully!",
            data: updatedAddress,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the address.",
            error: error.message,
        });
    }
};

// ✅ Delete Address
const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findById(id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        const deletedAddress = await address.deleteOne();

        if (!deletedAddress) {
            return res.status(400).json({
                success: false,
                message: "Failed to delete the address. Please try again.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Address deleted successfully!",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting the address.",
            error: error.message,
        });
    }
};

const getAddressByUser = async (req, res) => {
    try {
        console.log("getAddressByUser");

        const userId = req.userId; // Extract userId from request
   console.log(userId,"userId");
        // const user = await User.findById(userId).populate("address").select("address");
        const address = await Address.find({ user: userId });
        console.log(address,"address");

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Address retrieved successfully.",
            address,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the address.",
            error: error.message,
        });
    }
};

module.exports = { getAddresses, getSingleAddress, addAddress, updateAddress, deleteAddress, getAddressByUser };
