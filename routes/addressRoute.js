const express = require("express")
const router = express.Router()
const addressController = require("../controllers/addressController")
const { checkAuth } = require("../middlewares/checkAuth");

function abc (req,res,next){
    console.log("abc")
    next()
}
// address Management
//router.get("/", addressController.getAddresses); //→ Get address
router.get("/:id", addressController.getSingleAddress); //→ Get single address
//router.get("/all-address",abc,checkAuth, addressController.getAddressByUser); //→ Get single address
router.get("/",checkAuth, addressController.getAddressByUser); //→ Get address
router.post("/add",checkAuth, addressController.addAddress); //→ Add address
router.put("/update/:id", addressController.updateAddress); //→ Update address
router.delete("/remove/:id", addressController.deleteAddress); //→ Remove address 



module.exports = router;