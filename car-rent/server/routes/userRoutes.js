import express from "express";
import { loginUser, registerUser, getUserData, getCars } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser); // No protect here
userRouter.post('/login', loginUser); // No protect here
userRouter.get('/data', protect, getUserData); // Protect only where needed
userRouter.get('/cars', getCars); // No protect if public
export default userRouter;