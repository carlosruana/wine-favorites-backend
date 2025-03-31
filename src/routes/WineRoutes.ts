import express from 'express';
import { protect } from "../middleware/auth";
import { getWines,/* addWine,*/ getWineImage, deleteWine, getWineByName, toggleFavorite, getFavorites, getHistory, analyzeAndSaveImage, getWineDetails, deleteWineFromHistory } from '../controllers/WineController';

const router = express.Router();

// Protect all routes
router.use(protect);

// Wine Routes
router.get('/wines', getWines); // Get all wines
//router.post('/wines', addWine); // Add a new wine
router.get('/wines/:id/image', getWineImage); // Get a wine image by ID
router.get('/wines/:name', getWineByName); // Get a wine by its name
router.delete('/:id', deleteWine);

// Wine Favorites Routes
router.get('/wine-favorites', getFavorites); // Get all favorite wines
router.post('/wine-favorites/:id', toggleFavorite); // Toggle the favorite status of a wine


// Wine History Routes
router.get('/history', getWines); // Get wine history
router.delete('/history/:id', deleteWine); // Delete a wine from the history

// Wine Image Analysis
router.post('/image-analysis', analyzeAndSaveImage); // Analyze and save image

// Vivino Scraping Route
router.get('/wine-details/:name', getWineDetails); // Get wine details from Vivino

export default router;
