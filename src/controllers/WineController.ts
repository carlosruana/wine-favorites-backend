import { Request, Response } from 'express';
import Wine, { IWine } from '../models/Wine';
import History, { IHistory } from '../models/History';
import WineImage, { IWineImage } from '../models/WineImage';
import vision from '@google-cloud/vision';
import { scrapeVivino } from '../utils/vivinoScraper';
import { Buffer } from 'buffer';
import busboy from 'busboy';

// Configure Google Vision client
const client = new vision.ImageAnnotatorClient();

export const getWines = async (req: Request, res: Response<IWine[] | { message: string }>) => {
  try {
    const wines = await Wine.find();
    res.status(200).json(wines);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const addWine = async (req: Request, res: Response<IWine | { message: string }>) => {
  const { name, rating, comments, type, imageBase64 } = req.body;
  try {
    // Save the wine directly using the Wine.save() method
    const newWine: IWine = {
      name,
      rating,
      comments,
      type,
      favorite: false,
      image: imageBase64 ? Buffer.from(imageBase64, 'base64') : undefined, // Save the image as binary data if available
    };

    await Wine.save(newWine); // Use the save method directly
    res.status(201).json(newWine); // Return the new wine object
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const getWineByName = async (req: Request, res: Response<IWine | { message: string }>) => {
  const { name } = req.params;
  try {
    const wine = await Wine.findOne({ name });
    if (!wine) return res.status(404).json({ message: 'Wine not found' });
    res.status(200).json(wine);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const toggleFavorite = async (req: Request, res: Response<IWine | { message: string }>) => {
  const { id } = req.params;
  try {
    const wine = await Wine.findById(id);
    if (!wine) return res.status(404).json({ message: 'Wine not found' });
    wine.favorite = !wine.favorite;
    await Wine.save(wine); // Save the updated wine object
    res.status(200).json(wine);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const getFavorites = async (req: Request, res: Response<IWine[] | { message: string }>) => {
  try {
	console.log("Getting favorite wines");
    const favoriteWines = await Wine.find();
    res.status(200).json(favoriteWines);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const getHistory = async (req: Request, res: Response<IHistory[] | { message: string }>) => {
  try {
    const history = await History.find();
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const analyzeAndSaveImage = async (req: Request, res: Response) => {
  console.log("Received image upload request");
  
  const bb = busboy({ headers: req.headers });

  bb.on('file', async (_fieldname: any, file: {
    on: (event: string, callback: (data: any) => void) => void;
  }, info: { filename: string; mimeType: string; }) => {
    const { filename, mimeType } = info;
    const buffers: Buffer[] = [];

    file.on('data', (data) => buffers.push(data));

    file.on('end', async () => {
      try {
        const imageBuffer = Buffer.concat(buffers);

        // Analyze image with Google Vision API
        console.log("Analyzing image with Google Vision...");
        const [result] = await client.textDetection(imageBuffer);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0 || !detections[0].description) {
          return res.status(404).json({ message: 'No text found' });
        }

        const detectedWineName = detections[0].description.trim();
        console.log(`Detected wine name: ${detectedWineName}`);
        console.log(`Detected file info: ${info}`);

        // Create wine image object
        const wineImage: IWineImage = {
          filename: filename,
          contentType: mimeType,
          image: imageBuffer,
          wineName: detectedWineName,
          uploadDate: new Date(),
        };

        await WineImage.save(wineImage);

        res.status(200).json({ wineName: detectedWineName });
      } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ message: "Error analyzing image" });
      }
    });
  });

  req.pipe(bb);
};

export const getWineDetails = async (req: Request, res: Response) => {
  const { name } = req.params;
  try {
    const wineInfo = await scrapeVivino(name);
    if (wineInfo.length === 0) {
      return res.status(404).json({ message: 'Wine not found' });
    }
    res.status(200).json(wineInfo);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const deleteWineFromHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const historyEntry = await History.findById(id);
    if (!historyEntry) return res.status(404).json({ message: 'History entry not found' });

    await History.deleteById(id); // Use deleteById instead of findByIdAndDelete
    res.status(200).json({ message: 'History entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};
