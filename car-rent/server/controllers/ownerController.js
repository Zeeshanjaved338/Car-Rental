// controllers/ownerController.js
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

/* ──────────────────────────────────────────────── */
/* 1) CHANGE ROLE → owner                           */
/* ──────────────────────────────────────────────── */
export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { role: "owner" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Now you can list cars" });
  } catch (error) {
    console.log("❌ changeRoleToOwner error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────── */
/* 2) ADD CAR (only owner)                          */
/* ──────────────────────────────────────────────── */
export const addCar = async (req, res) => {
  try {
    const user = req.user;
    if (
      !user ||
      typeof user.role !== "string" ||
      user.role.trim().toLowerCase() !== "owner"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only owners can add cars.",
      });
    }

    if (!req.body.carData) {
      return res.status(400).json({
        success: false,
        message: "carData is missing.",
      });
    }

    let carPayload;
    try {
      carPayload = JSON.parse(req.body.carData);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: `"${req.body.carData}" is not valid JSON.`,
      });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: "Image file is required.",
      });
    }

    try {
      if (!fs.existsSync(req.file.path)) {
        throw new Error("Temporary file not found");
      }

      const fileBuffer = fs.readFileSync(req.file.path);
      const uploadResponse = await imagekit.upload({
        file: fileBuffer,
        fileName: req.file.originalname,
        folder: "/cars",
      });

      const imageUrl = imagekit.url({
        path: uploadResponse.filePath,
        transformation: [
          { width: "1280" },
          { quality: "auto" },
          { format: "webp" },
        ],
      });

      const newCar = await Car.create({
        ...carPayload,
        owner: user._id,
        image: imageUrl,
      });

      return res.status(201).json({
        success: true,
        message: "Car added successfully!",
        carId: newCar._id,
      });
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: `Image upload failed: ${uploadError.message}`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("❌ File cleanup error:", err.message);
      });
    }
  }
};

/* ──────────────────────────────────────────────── */
/* 3) GET OWNER CARS                                */
/* ──────────────────────────────────────────────── */
export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id });

    res.json({ success: true, cars });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────── */
/* 4) TOGGLE AVAILABILITY                           */
/* ──────────────────────────────────────────────── */
export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();
    res.json({ success: true, message: "Availability Toggled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────── */
/* 5) DELETE CAR                                     */
/* ──────────────────────────────────────────────── */
export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    if (car.owner.toString() !== _id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Car.findByIdAndDelete(carId);
    res.json({ success: true, message: "Car Removed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────── */
/* 6) OWNER DASHBOARD DATA                          */
/* ──────────────────────────────────────────────── */
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== "owner") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const cars = await Car.find({ owner: _id });
    const bookings = await Booking.find({ owner: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    const pendingBookings = bookings.filter((b) => b.status === "pending");
    const completeBookings = bookings.filter((b) => b.status === "confirmed");

    const monthlyRevenue = completeBookings.reduce((acc, b) => acc + b.price, 0);

    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completeBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/* ──────────────────────────────────────────────── */
/* 7) UPDATE USER IMAGE                             */
/* ──────────────────────────────────────────────── */
export const updateUserImage = async (req, res) => {
  try {
    const { _id } = req.user;
    const imageFile = req.file;

    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/users",
    });

    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: "400" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    await User.findByIdAndUpdate(_id, { image: optimizedImageUrl });
    res.json({ success: true, message: "Image Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
