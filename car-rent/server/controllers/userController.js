
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Car from "../models/Car.js"; // ✅ Add this line


const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
// Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required (password ≥ 8 chars)" });
    }
    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = generateToken(user._id.toString());
    res.status(201).json({ success: true, token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
//login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    const token = generateToken(user._id.toString());
    res.json({ success: true, token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

//Get user data using token (jwt)
export const getUserData = async (req, res)=>{
  try{
   const{user}=req;
   res.json({success:true, user})
  } catch (error){
     console.error(err.message);
    res.status(500).json({ success: false, message: err.message});
  }
}

// Get all cars for frontend
export const getCars = async(req, res)=>{
  try {
    const cars = await Car.find({isAvailable: true})
    res.json({success: true, cars})
  } catch (error) {
    console.log(error.message)
    res.json({success: false, message: error.message})
  }
}

