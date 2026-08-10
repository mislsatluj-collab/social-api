const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", true);

        await mongoose.connect(env.MONGO_URI);

        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;