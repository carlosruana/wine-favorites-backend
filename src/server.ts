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

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://topwines.vercel.app']
  : ['http://localhost:3000', 'http://localhost:3001'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (arg0: Error | null, arg1: boolean | undefined) => void) => {
    if (!origin || allowedOrigins.includes(origin)) { // Allow undefined origin or check if the origin is in the allowed list
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Use login routes
app.use(loginRoutes);

// Do not let server to sleep
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Use wine protected routes
app.use(wineRoutes);



export default app;
