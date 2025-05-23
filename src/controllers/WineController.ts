import { Request, Response } from 'express';
import Wine, { IWine } from '../models/Wine';
import History, { IHistory } from '../models/History';
//import WineImage, { IWineImage } from '../models/WineImage';
import vision from '@google-cloud/vision';
import { scrapeVivino } from '../utils/vivinoScraper';
import { Buffer } from 'buffer';
import busboy from 'busboy';
import { AuthRequest } from '../middleware/auth';

// Configure Google Vision client
const client = new vision.ImageAnnotatorClient();

export type ReturnedWine = Omit<IWine, 'image'> & { image: string | null };

export const getWines = async (req: AuthRequest, res: Response<ReturnedWine[] | { message: string }>) => {
  try {
	const userId = req.userId; // Extract userId from the JWT token
	console.log(`Getting wines for user ID: ${userId}`);
    const wines = await Wine.find({ userId });

    const winesWithImageUrls = wines.map(wine => ({
      ...wine,
      image: wine.image
        ? `${process.env.BASE_URL}/wines/${wine._id}/image`
        : null,
    }));
	console.log("Wines with image URLs: ", winesWithImageUrls);

    res.status(200).json(winesWithImageUrls);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const getWineImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    console.log(`Fetching wine with ID: ${id}`);
    const wine = await Wine.findById(id);
    if (!wine) {
      console.log('Wine not found');
      return res.status(404).json({ message: 'Wine not found' });
    }
    if (!wine.image || !wine.mimeType) {
      console.log('Image or MIME type missing');
      return res.status(404).json({ message: 'Image not found' });
    }

    console.log(`Serving image for wine ID: ${id}`);
    const imageBuffer = Buffer.from(wine.image.buffer); // Convert MongoDB Binary to Buffer
    res.set('Content-Type', wine.mimeType);
    res.send(imageBuffer); // Send the binary image data
  } catch (error) {
    console.error('Error fetching wine image:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const deleteWine = async (req: AuthRequest, res: Response<{ message: string }>) => {
  const { id } = req.params;
  const userId = req.userId; // Extract userId from the JWT token
  try {
    const wine = await Wine.findById(id);
    if (!wine) {
      return res.status(404).json({ message: 'Wine not found' });
    }

	if (wine.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this wine' });
    }

    await Wine.deleteOneById({ id: id }); // Delete the wine by ID
    res.status(200).json({ message: 'Wine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

/*export const addWine = async (req: Request, res: Response<IWine | { message: string }>) => {
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
};*/

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
    const favoriteWines = await Wine.findFavorites();
    res.status(200).json(favoriteWines);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  try {
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const history = await History.find(userId);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const analyzeAndSaveImage = async (req: AuthRequest, res: Response) => {
  const userId = req.userId; // Extract userId from the JWT token
  if (!userId) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  
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

		// Log the MIME type for debugging
        console.log(`Uploaded file MIME type: ${mimeType}`);

        // Ensure the file is an image
        if (!mimeType.startsWith('image/')) {
          return res.status(400).json({ message: 'Uploaded file is not an image' });
        }

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
        const wineImage: IWine = {
          name: detectedWineName || filename,
          //contentType: mimeType,
          image: imageBuffer,
		  mimeType,
          //wineName: detectedWineName,
          uploadDate: new Date(),
		  favorite: false,
		  userId
        };

        await Wine.save(wineImage);

        res.status(200).json({ wineName: detectedWineName || filename });
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
	console.log("Wine info: ", wineInfo);
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

export const addToHistory = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { wineName, image } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const historyEntry: IHistory = {
      wineName,
      image,
      uploadDate: new Date().toISOString(), // Convert Date to ISO string
      userId
    };

    await History.save(historyEntry);
    res.status(201).json({ message: 'Added to history successfully' });
  } catch (error) {
    console.error('Error adding to history:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};
