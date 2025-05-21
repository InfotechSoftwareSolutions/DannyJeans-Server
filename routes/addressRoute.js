const express = require("express")
const router = express.Router()
const addressController = require("../controllers/addressController")
const { checkAuth } = require("../middlewares/checkAuth");


// address Management
//router.get("/", addressController.getAddresses); //→ Get address
router.get("/all",addressController.getAddresses); //→ Get single address
router.get("/:id", addressController.getSingleAddress); //→ Get single address
router.get("/",checkAuth, addressController.getAddressByUser); //→ Get address
router.post("/add",checkAuth, addressController.addAddress); //→ Add address
router.put("/update/:id", addressController.updateAddress); //→ Update address
router.delete("/remove/:id", addressController.deleteAddress); //→ Remove address 



module.exports = router;