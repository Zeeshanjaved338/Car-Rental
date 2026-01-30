import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

// ───────────────────────────────────────────────
// Helper: Check availability for given car & dates
// ───────────────────────────────────────────────
const checkAvailability = async (carId, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car: carId,
    $or: [
      {
        pickupDate: { $lte: returnDate },
        returnDate: { $gte: pickupDate },
      },
    ],
  });
  return bookings.length === 0;
};

// ───────────────────────────────────────────────
// API: Check car availability for a location & dates
// ───────────────────────────────────────────────
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    const cars = await Car.find({ location, isAvailable: true });

    const availabilityPromises = cars.map(async (car) => {
      const isAvailable = await checkAvailability(car._id, pickupDate, returnDate);
      return { ...car._doc, isAvailable };
    });

    let availableCars = await Promise.all(availabilityPromises);
    availableCars = availableCars.filter((car) => car.isAvailable);

    res.status(200).json({ success: true, availableCars });
  } catch (error) {
    console.error("Error in checkAvailabilityOfCar:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ───────────────────────────────────────────────
// API: Create a new booking
// ───────────────────────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { car, pickupDate, returnDate } = req.body;

    // Check availability
    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: "Car is not available" });
    }

    // Get car info
    const carData = await Car.findById(car);
    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
    const price = carData.pricePerDay * noOfDays;

    // Create booking
    await Booking.create({
      car,
      owner: carData.owner,
      user: _id,
      pickupDate,
      returnDate,
      price,
    });

    res.status(201).json({ success: true, message: "Booking Created" });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ───────────────────────────────────────────────
// API: Get all bookings of logged-in user
// ───────────────────────────────────────────────
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error in getUserBookings:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch user bookings" });
  }
};

// ───────────────────────────────────────────────
// API: Get all bookings for car owner
// ───────────────────────────────────────────────
export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error in getOwnerBookings:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch owner bookings" });
  }
};

// ───────────────────────────────────────────────
// API: Change booking status (for owner)
// ───────────────────────────────────────────────
export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const { _id } = req.user;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.owner.toString() !== _id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error("Error in changeBookingStatus:", error.message);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};
