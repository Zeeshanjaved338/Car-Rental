import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    mongoose.connection.on("connected", () => {
      console.log("Database Connected");
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error.message);
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5-second timeout
      connectTimeoutMS: 10000, // 10-second connection timeout
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit app on DB connection failure
  }
};

export default connectDB;