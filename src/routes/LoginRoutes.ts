import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

// Opciones de la cookie
const cookieOptions = {
  httpOnly: true, // Evita accesos desde JavaScript
  secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
  sameSite: 'strict' as const, // Previene ataques CSRF
  maxAge: 60 * 60 * 1000, // 1 hora
};

// Register a new user
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.save({ email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.cookie("token", token, cookieOptions).status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login a user
router.post("/login", async (req, res) => {
	console.log("Login");
  const { email, password } = req.body;
  try {
	console.log(email);
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.cookie("token", token, cookieOptions).status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
