import express from "express";
import { addCar, changeRoleToOwner, getOwnerCars, toggleCarAvailability, deleteCar, getDashboardData, updateUserImage } from "../controllers/ownerController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

/* keep as-is */
ownerRouter.post("/change-role", protect, changeRoleToOwner);

/* ⬇︎ use the exact field name “image” (lower-case) */
ownerRouter.post("/add-car", protect, upload.single("image"), addCar);
ownerRouter.get("/cars", protect, getOwnerCars);
ownerRouter.post("/toggle-car", protect, toggleCarAvailability);
ownerRouter.post("/delete-car", protect, deleteCar);
ownerRouter.get("/dashboard-data", protect, getDashboardData);

// Optional: Keep /dashboard if intentional, otherwise remove
ownerRouter.get("/dashboard", protect, getDashboardData);

// Update middleware order for file upload
ownerRouter.post("/update-image", upload.single("image"), protect, updateUserImage);

export default ownerRouter;