const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  offer_price: { type: Number},
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }, // For subcategories
  // status: {
  //   type: Boolean,
  //   required: [true, "Status is required"],
  //   default: true,
  // },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = {
    Category: mongoose.model("Category", categorySchema),
};

