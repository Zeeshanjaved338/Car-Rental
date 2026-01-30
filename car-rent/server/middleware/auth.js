import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle either 'id' or '_id' depending on how token was created
    const userId = decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token: no user ID",
      });
    }

    // Check if user exists in DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user to request for downstream use
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ protect middleware error:", error.message);

    if (["JsonWebTokenError", "TokenExpiredError"].includes(error.name)) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (error.name === "CastError") {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID in token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
