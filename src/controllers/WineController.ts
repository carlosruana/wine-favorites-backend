import { Request, Response } from 'express';
import Wine, { IWine } from '../models/Wine';
import History, { IHistory } from '../models/History';
import vision from '@google-cloud/vision';
import { scrapeVivino } from '../utils/vivinoScraper';
import path from 'path';

// Configure Google Vision client
const client = new vision.ImageAnnotatorClient({
	keyFilename: path.join(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS ?? './path/to/wines-426406-2d14643d2f06.json'),
  });

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

export const addWine = async (req: Request, res: Response) => {
    const { name, rating, comments, type } = req.body;
    try {
        const newWine = await Wine.save({ name, rating, comments, type, favorite: false });
        res.status(201).json(newWine);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

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

export const toggleFavorite = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const wine = await Wine.findById(id);
        if (!wine) {
            return res.status(404).json({ message: 'Wine not found' });
        }
        const updatedWine = await Wine.update(id, { favorite: !wine.favorite });
        res.status(200).json(updatedWine);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

export const getFavorites = async (req: Request, res: Response) => {
    try {
        const favoriteWines = await Wine.findFavorites();
        res.status(200).json(favoriteWines);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const history = await History.find();
        res.status(200).json(history);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

export const analyzeAndSaveImage = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = (req.file as any).location; // S3 URL of the uploaded file
    try {
        // Analyze the image using Google Vision API for text detection
        const [result] = await client.textDetection(imageUrl);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0 || !detections[0].description) {
            return res.status(404).json({ message: 'No text found' });
        }

        // Extract detected text
        const detectedText = detections[0].description.trim();

        // Save to history
        const historyEntry = await History.save({
            imageUrl,
            wineName: detectedText
        });

        res.status(200).json({ wineName: detectedText });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

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


export const deleteWineFromHistory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const historyEntry = await History.findById(id);
        if (!historyEntry) {
            return res.status(404).json({ message: 'History entry not found' });
        }
        await History.deleteById(id);
        res.status(200).json({ message: 'History entry deleted' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};
