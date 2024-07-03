import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wineRoutes from './routes/WineRoutes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);

app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Use wine routes
app.use('/api', wineRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
