const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    product_price: { type: Number },
    sale_price: { type: Number},
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    category:{ type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    trending: { type: Boolean, default: false },
    today_offer: { type: Boolean, default: false },
    variant: [{
      colour_varient: { type: String, required: true },
      size_varient: [{
        size: { type: Number, required: true },
        qty: { type: Number, required: true }
      }]
    }],
    // status: {
    //   type: Boolean,
    //   required: [true, "Status is required"],
    //   default: true,
    // },
    isActive: { type: Boolean, default: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }], // Array of image URLs
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    // colors: [{ type: String }], // Array of available colors
    // sizes: [{ type: String }], // Array of available sizes (e.g., "S", "M", "L", "XL")
  },
  { timestamps: true }
);

module.exports = {
  Product: mongoose.model("Product", productSchema),
};
