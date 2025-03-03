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
exports.deleteWineFromHistory = exports.getWineDetails = exports.analyzeAndSaveImage = exports.getHistory = exports.getFavorites = exports.toggleFavorite = exports.getWineByName = exports.addWine = exports.getWines = void 0;
const Wine_1 = __importDefault(require("../models/Wine"));
const History_1 = __importDefault(require("../models/History"));
const WineImage_1 = __importDefault(require("../models/WineImage"));
const vision_1 = __importDefault(require("@google-cloud/vision"));
const vivinoScraper_1 = require("../utils/vivinoScraper");
const buffer_1 = require("buffer");
const busboy_1 = __importDefault(require("busboy"));
// Configure Google Vision client
const client = new vision_1.default.ImageAnnotatorClient();
const getWines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getting wines");
        const wines = yield Wine_1.default.find();
        res.status(200).json(wines);
    }
    catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
exports.getWines = getWines;
const addWine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, rating, comments, type, imageBase64 } = req.body;
    try {
        // Save the wine directly using the Wine.save() method
        const newWine = {
            name,
            rating,
            comments,
            type,
            favorite: false,
            image: imageBase64 ? buffer_1.Buffer.from(imageBase64, 'base64') : undefined, // Save the image as binary data if available
        };
        yield Wine_1.default.save(newWine); // Use the save method directly
        res.status(201).json(newWine); // Return the new wine object
    }
    catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
exports.addWine = addWine;
const getWineByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    try {
        const wine = yield Wine_1.default.findOne({ name });
        if (!wine)
            return res.status(404).json({ message: 'Wine not found' });
        res.status(200).json(wine);
    }
    catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
exports.getWineByName = getWineByName;
const toggleFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const wine = yield Wine_1.default.findById(id);
        if (!wine)
            return res.status(404).json({ message: 'Wine not found' });
        wine.favorite = !wine.favorite;
        yield Wine_1.default.save(wine); // Save the updated wine object
        res.status(200).json(wine);
    }
    catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
exports.toggleFavorite = toggleFavorite;
const getFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Getting favorite wines");
        const favoriteWines = yield Wine_1.default.find();
        res.status(200).json(favoriteWines);
    }
    catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
exports.getFavorites = getFavorites;
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const history = yield History_1.default.find();
        res.status(200).json(history);
    }
    catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
exports.getHistory = getHistory;
const analyzeAndSaveImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received image upload request");
    const bb = (0, busboy_1.default)({ headers: req.headers });
    bb.on('file', (_fieldname, file, info) => __awaiter(void 0, void 0, void 0, function* () {
        const { filename, mimeType } = info;
        const buffers = [];
        file.on('data', (data) => buffers.push(data));
        file.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const imageBuffer = buffer_1.Buffer.concat(buffers);
                // Analyze image with Google Vision API
                console.log("Analyzing image with Google Vision...");
                const [result] = yield client.textDetection(imageBuffer);
                const detections = result.textAnnotations;
                if (!detections || detections.length === 0 || !detections[0].description) {
                    return res.status(404).json({ message: 'No text found' });
                }
                const detectedWineName = detections[0].description.trim();
                console.log(`Detected wine name: ${detectedWineName}`);
                console.log(`Detected file info: ${info}`);
                // Create wine image object
                const wineImage = {
                    filename: filename,
                    contentType: mimeType,
                    image: imageBuffer,
                    wineName: detectedWineName,
                    uploadDate: new Date(),
                };
                yield WineImage_1.default.save(wineImage);
                res.status(200).json({ wineName: detectedWineName });
            }
            catch (error) {
                console.error("Error processing image:", error);
                res.status(500).json({ message: "Error analyzing image" });
            }
        }));
    }));
    req.pipe(bb);
});
exports.analyzeAndSaveImage = analyzeAndSaveImage;
const getWineDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    try {
        const wineInfo = yield (0, vivinoScraper_1.scrapeVivino)(name);
        if (wineInfo.length === 0) {
            return res.status(404).json({ message: 'Wine not found' });
        }
        res.status(200).json(wineInfo);
    }
    catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
exports.getWineDetails = getWineDetails;
const deleteWineFromHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const historyEntry = yield History_1.default.findById(id);
        if (!historyEntry)
            return res.status(404).json({ message: 'History entry not found' });
        yield History_1.default.deleteById(id); // Use deleteById instead of findByIdAndDelete
        res.status(200).json({ message: 'History entry deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
exports.deleteWineFromHistory = deleteWineFromHistory;
//# sourceMappingURL=WineController.js.map