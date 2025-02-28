import express from 'express';
import { getWines, addWine, getWineByName, toggleFavorite, getFavorites, getHistory, analyzeAndSaveImage, getWineDetails, deleteWineFromHistory } from '../controllers/WineController';

const router = express.Router();

// Wine Routes
router.get('/wines', getWines); // Get all wines
router.post('/wines', addWine); // Add a new wine
router.get('/wines/:name', getWineByName); // Get a wine by its name

// Wine Favorites Routes
router.get('/wine-favorites', getFavorites); // Get all favorite wines
router.post('/wine-favorites/:id', toggleFavorite); // Toggle the favorite status of a wine


// Wine History Routes
router.get('/history', getHistory); // Get wine history
router.delete('/history/:id', deleteWineFromHistory); // Delete a wine from the history

// Wine Image Analysis
router.post('/image-analysis', analyzeAndSaveImage); // Analyze and save image

// Vivino Scraping Route
router.get('/wine-details/:name', getWineDetails); // Get wine details from Vivino

export default router;
