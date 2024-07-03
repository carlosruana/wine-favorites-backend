import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import wineRoutes from './routes/WineRoutes';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
// Otros middlewares y configuraciones
app.use(express.json());

// Configurar el middleware para servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Llamadas de las diferentes rutas de la app
app.use('/api', wineRoutes);

mongoose.connect(process.env.MONGO_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true
} as mongoose.ConnectOptions) // Casting to mongoose.ConnectOptions to avoid type issues
.then(() => console.log('MongoDB connected'))
.catch((error) => console.log('MongoDB connection error:', error));

export default app;
