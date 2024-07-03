"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const WineController_1 = require("../controllers/WineController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.get('/wines', WineController_1.getWines);
router.post('/wines', WineController_1.addWine);
router.get('/wines/:name', WineController_1.getWineByName); // Obtener un vino por nombre desde la base de datos
router.post('/wines/:id/favorite', WineController_1.toggleFavorite);
router.get('/favorites', WineController_1.getFavorites);
router.get('/history', WineController_1.getHistory);
router.post('/analyze', upload.single('image'), WineController_1.analyzeAndSaveImage);
router.get('/wines/details/:name', WineController_1.getWineDetails); // Obtener detalles del vino desde Vivino
exports.default = router;
//# sourceMappingURL=WineRoutes.js.map