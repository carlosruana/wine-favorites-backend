import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wineRoutes from './routes/WineRoutes';
import path from 'path';
import { connectDB } from './db';

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

app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Use wine routes
app.use(wineRoutes);

export default app;
