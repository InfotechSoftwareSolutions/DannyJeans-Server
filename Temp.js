//✅Add a new product

//1.
// const { name, description, price, category, stock, images } = req.body;

// Validation
// if ((!name || !description || !price || !category || !stock, images)) {
//     return res.status(400).json({ message: "All fields are required." });
// }

//2.

// if (typeof category !== "string") {
//     return res.status(400).json({ message: "Invalid type: category must be a string." });
// }

// ✅Get All Products
//1.
// const product = await Product.find().populate("parentCategory", "name");

//2.
// Validation: Check if products exist
// if (!product || product.length === 0) {

// ✅ Get Single product
// const category = await Product.findById(id).populate("parentCategory", "name");

//******************************
// ✅ Get All Categories
// const categories = await Category.find().populate("parentCategory", "name");

// ✅ Get Single Category
// const category = await Category.findById(id).populate("parentCategory", "name");

// ✅ Add New Category
// const { name, description, parentCategory } = req.body;

// Validation
// if (!name || !description || !parentCategory) {
//     return res.status(400).json({ success: false, message: "All fields are required." });
// }

// *************************************************
// ✅ Add a New Address

// const { user, fullName, phone, street, city, state, zip, country, isDefault } = req.body;

// Validation
// if (!user || !fullName || !phone || !street || !city || !state || !zip || !country) {
//     return res.status(400).json({ success: false, message: "All fields are required." });
// }
