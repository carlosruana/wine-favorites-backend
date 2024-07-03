"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWineDetails = exports.analyzeAndSaveImage = exports.getHistory = exports.getFavorites = exports.toggleFavorite = exports.getWineByName = exports.addWine = exports.getWines = void 0;
const wine_1 = __importDefault(require("../models/wine"));
const History_1 = __importDefault(require("../models/History"));
const fs_1 = __importDefault(require("fs"));
const vision_1 = __importDefault(require("@google-cloud/vision"));
const vivinoScraper_1 = require("../utils/vivinoScraper");
// Configura el cliente de Google Vision
const client = new vision_1.default.ImageAnnotatorClient({
    keyFilename: 'wines-426406-2d14643d2f06.json', // Reemplaza esto con la ruta al archivo de claves JSON
});
// Obtener todos los vinos
const getWines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wines = yield wine_1.default.find();
        res.status(200).json(wines);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.getWines = getWines;
// Agregar un vino
const addWine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, rating, comments, type } = req.body;
    try {
        const newWine = new wine_1.default({ name, rating, comments, type });
        yield newWine.save();
        res.status(201).json(newWine);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.addWine = addWine;
// Obtener un vino por nombre desde la base de datos
const getWineByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    try {
        const wine = yield wine_1.default.findOne({ name });
        if (!wine) {
            return res.status(404).json({ message: 'Wine not found' });
        }
        res.status(200).json(wine);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.getWineByName = getWineByName;
// Marcar un vino como favorito
const toggleFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const wine = yield wine_1.default.findById(id);
        if (!wine) {
            return res.status(404).json({ message: 'Wine not found' });
        }
        wine.favorite = !wine.favorite;
        yield wine.save();
        res.status(200).json(wine);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.toggleFavorite = toggleFavorite;
// Obtener vinos favoritos
const getFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const favoriteWines = yield wine_1.default.find({ favorite: true });
        res.status(200).json(favoriteWines);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.getFavorites = getFavorites;
// Obtener el historial de imágenes subidas
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const history = yield History_1.default.find().sort({ uploadDate: -1 });
        res.status(200).json(history);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.getHistory = getHistory;
// Analizar la imagen de la botella de vino y guardar en el historial
const analyzeAndSaveImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    try {
        // Analiza la imagen utilizando la API de Google Vision para detección de texto
        const filePath = req.file.path;
        const [result] = yield client.textDetection(filePath);
        const detections = result.textAnnotations;
        if (!detections || detections.length === 0 || !detections[0].description) {
            return res.status(404).json({ message: 'No text found' });
        }
        // Extrae el texto detectado
        const detectedText = detections[0].description.trim();
        // Elimina la imagen después del análisis
        fs_1.default.unlinkSync(filePath);
        // Guarda en el historial
        const historyEntry = new History_1.default({
            imageUrl,
            wineName: detectedText,
        });
        yield historyEntry.save();
        res.status(200).json({ wineName: detectedText }); // Retorna el nombre del vino correctamente
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.analyzeAndSaveImage = analyzeAndSaveImage;
// Obtener detalles del vino desde Vivino
const getWineDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    try {
        const wineInfo = yield (0, vivinoScraper_1.scrapeVivino)(name);
        if (wineInfo.length === 0) {
            res.status(404).json({ message: 'Wine not found' });
        }
        else {
            res.status(200).json(wineInfo);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.getWineDetails = getWineDetails;
//# sourceMappingURL=WineController.js.map