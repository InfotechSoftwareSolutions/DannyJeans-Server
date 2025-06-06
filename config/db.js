const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const  connection  = await mongoose.connect(process.env.MONGO_URI,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected: ");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDb;