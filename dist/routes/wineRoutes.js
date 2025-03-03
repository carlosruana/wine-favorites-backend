"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const WineController_1 = require("../controllers/WineController");
const router = express_1.default.Router();
// Wine Routes
router.get('/wines', WineController_1.getWines); // Get all wines
router.post('/wines', WineController_1.addWine); // Add a new wine
router.get('/wines/:name', WineController_1.getWineByName); // Get a wine by its name
// Wine Favorites Routes
router.get('/wine-favorites', WineController_1.getFavorites); // Get all favorite wines
router.post('/wine-favorites/:id', WineController_1.toggleFavorite); // Toggle the favorite status of a wine
// Wine History Routes
router.get('/history', WineController_1.getHistory); // Get wine history
router.delete('/history/:id', WineController_1.deleteWineFromHistory); // Delete a wine from the history
// Wine Image Analysis
router.post('/image-analysis', WineController_1.analyzeAndSaveImage); // Analyze and save image
// Vivino Scraping Route
router.get('/wine-details/:name', WineController_1.getWineDetails); // Get wine details from Vivino
exports.default = router;
//# sourceMappingURL=WineRoutes.js.map