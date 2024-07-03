import { Request, Response } from 'express';
import Wine, { IWine } from '../models/wine';
import History from '../models/History';
import fs from 'fs';
import vision from '@google-cloud/vision';
import { scrapeVivino } from '../utils/vivinoScraper';

// Configura el cliente de Google Vision
const client = new vision.ImageAnnotatorClient({
  keyFilename: 'wines-426406-2d14643d2f06.json', // Reemplaza esto con la ruta al archivo de claves JSON
});

// Obtener todos los vinos
export const getWines = async (req: Request, res: Response) => {
	try {
	  const wines = await Wine.find();
	  res.status(200).json(wines);
	} catch (error) {
	  if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	  } else {
		res.status(500).json({ message: 'An unknown error occurred' });
	  }
	}
  };

// Agregar un vino
export const addWine = async (req: Request, res: Response) => {
	const { name, rating, comments, type } = req.body;
  
	try {
	  const newWine = new Wine({ name, rating, comments, type });
	  await newWine.save();
	  res.status(201).json(newWine);
	} catch (error) {
	  if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	  } else {
		res.status(500).json({ message: 'An unknown error occurred' });
	  }
	}
  };

// Obtener un vino por nombre desde la base de datos
export const getWineByName = async (req: Request, res: Response) => {
	const { name } = req.params;
  
	try {
	  const wine = await Wine.findOne({ name });
	  if (!wine) {
		return res.status(404).json({ message: 'Wine not found' });
	  }
	  res.status(200).json(wine);
	} catch (error) {
	  if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	  } else {
		res.status(500).json({ message: 'An unknown error occurred' });
	  }
	}
  };

// Marcar un vino como favorito
export const toggleFavorite = async (req: Request, res: Response) => {
	const { id } = req.params;
  
	try {
	  const wine = await Wine.findById(id);
	  if (!wine) {
		return res.status(404).json({ message: 'Wine not found' });
	  }
	  wine.favorite = !wine.favorite;
	  await wine.save();
	  res.status(200).json(wine);
	} catch (error) {
	  if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	  } else {
		res.status(500).json({ message: 'An unknown error occurred' });
	  }
	}
  };

// Obtener vinos favoritos
export const getFavorites = async (req: Request, res: Response) => {
	try {
	  const favoriteWines = await Wine.find({ favorite: true });
	  res.status(200).json(favoriteWines);
	} catch (error) {
	  if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	  } else {
		res.status(500).json({ message: 'An unknown error occurred' });
	  }
	}
  };

// Obtener el historial de imágenes subidas
export const getHistory = async (req: Request, res: Response) => {
	try {
	  const history = await History.find().sort({ uploadDate: -1 });
	  res.status(200).json(history);
	} catch (error) {
	  if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	  } else {
		res.status(500).json({ message: 'An unknown error occurred' });
	  }
	}
  };

// Analizar la imagen de la botella de vino y guardar en el historial
export const analyzeAndSaveImage = async (req: Request, res: Response) => {
	if (!req.file) {
	  return res.status(400).json({ message: 'No file uploaded' });
	}
  
	const imageUrl = `/uploads/${req.file.filename}`;  // Asegúrate de que esta ruta sea correcta
	try {
	  // Analiza la imagen utilizando la API de Google Vision para detección de texto
	  const filePath = req.file.path;
	  const [result] = await client.textDetection(filePath);
	  const detections = result.textAnnotations;
  
	  if (!detections || detections.length === 0 || !detections[0].description) {
		return res.status(404).json({ message: 'No text found' });
	  }
  
	  // Extrae el texto detectado
	  const detectedText = detections[0].description.trim();
  
	  // Guarda en el historial
	  const historyEntry = new History({
		imageUrl,
		wineName: detectedText,
	  });
	  await historyEntry.save();
  
	  res.status(200).json({ wineName: detectedText }); // Retorna el nombre del vino correctamente
	} catch (error) {
	  if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	  } else {
		res.status(500).json({ message: 'An unknown error occurred' });
	  }
	}
  };

// Obtener detalles del vino desde Vivino
export const getWineDetails = async (req: Request, res: Response) => {
	const { name } = req.params;
	try {
	  const wineInfo = await scrapeVivino(name);
	  if (wineInfo.length === 0) {
		res.status(404).json({ message: 'Wine not found' });
	  } else {
		res.status(200).json(wineInfo);
	  }
	} catch (error) {
	  if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	  } else {
		res.status(500).json({ message: 'An unknown error occurred' });
	  }
	}
  };

  // Eliminar una entrada del historial
export const deleteWineFromHistory = async (req: Request, res: Response) => {
	const { id } = req.params;
  
	try {
	  const historyEntry = await History.findById(id);
	  if (!historyEntry) {
		return res.status(404).json({ message: 'History entry not found' });
	  }
  
	  await History.findByIdAndDelete(id);
	  res.status(200).json({ message: 'History entry deleted' });
	} catch (error) {
	  if (error instanceof Error) {
		res.status(500).json({ message: error.message });
	  } else {
		res.status(500).json({ message: 'An unknown error occurred' });
	  }
	}
  };