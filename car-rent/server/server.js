import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

const app = express();

// Connect to MongoDB with error handling
const startServer = async () => {
  try {
    await connectDB(); // Mongo
    app.use(cors());
    app.use(express.json());

    // Test
    app.get("/", (_, res) => res.send("Server is running"));

    // Prefix ALL api routes with /api
    app.use("/api/users", userRouter);
    app.use("/api/owner", ownerRouter);
    app.use("/api/bookings", bookingRouter);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();