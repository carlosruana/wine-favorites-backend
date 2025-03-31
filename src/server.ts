import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wineRoutes from './routes/WineRoutes';
import loginRoutes from "./routes/LoginRoutes";
import path from 'path';
import { connectDB } from './db';
import cookieParser from "cookie-parser";

dotenv.config();

// Create the express app instance
const app = express();

const port = process.env.PORT || 5000;
// Connect to MongoDB before starting the server
connectDB().then(() => {
  // Use the port from environment variable, or default to 5000
  const port = process.env.PORT || 5000;
  
  // Start the server after successful DB connection
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

app.use(cors({
  origin: "http://localhost:3000", // Allow frontend domain
  credentials: true, // Allow cookies and authentication headers
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Use login routes
app.use(loginRoutes);

// Use wine routes
app.use(wineRoutes);


export default app;
