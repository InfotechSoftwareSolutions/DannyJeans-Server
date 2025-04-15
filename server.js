const express = require("express")
// const cookieParser = require('cookie-parser')
const cors = require('cors')
const connectDb = require("./config/db");
// const userRoute = require('./routes/userRoute')
// const adminRoute = require('./routes/adminRoute');
const morgan = require("morgan");

// const cartRoute = require('./routes/cartRoute');
const categoryRoute = require('./routes/categoryRoute');
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute')
const orderRoute = require('./routes/orderRoute')
const addressRoute = require('./routes/addressRoute')
const offerRoute = require('./routes/offerRoute')


// const orderRoute = require('./routes/orderRoute');
// const paymentRoute = require('./routes/paymentIntegrationRoute');
// const reviewRatingsRoute = require('./routes/reviewRatings');

const errorHandle = require("./middlewares/errorHandle");

const app = express()
require('dotenv').config()
connectDb()

// app.use(cors({
//   origin:"http://192.168.1.33:5174",
//   credentials:true
// }))

app.use(cors())

// Use Morgan middleware
app.use(morgan("dev")); // Logs HTTP requests in a concise format


app.use(express.json())
// app.use(cookieParser())

// app.use("/", userRoute);
// app.use("/admin", adminRoute);

app.use("/", userRoute);
app.use("/category", categoryRoute);
app.use("/product", productRoute);
app.use("/order", orderRoute);
app.use("/address", addressRoute);
app.use("/offer", offerRoute);
// app.use("/order", orderRoute);
// app.use("/payment", paymentRoute);
// app.use("/reviews-ratings", reviewRatingsRoute);

//  Error Handling
app.use(errorHandle);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);