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
exports.scrapeVivino = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const scrapeVivino = (wineName) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://www.vivino.com/search/wines?q=${encodeURIComponent(wineName)}`;
    try {
        const { data } = yield axios_1.default.get(url);
        const $ = cheerio_1.default.load(data);
        const results = [];
        // Usar el selector actualizado para las tarjetas de vino
        $('.search-results-list .default-wine-card').each((_, element) => {
            const name = $(element).find('.wine-card__name').text().trim();
            const link = $(element).find('.wine-card__name a').attr('href') || '';
            // Obtener la URL de la imagen desde el estilo 'background-image'
            let image = $(element).find('.wine-card__image').css('background-image');
            if (typeof image === 'string') {
                // Extraer la URL de la imagen del estilo 'background-image'
                const match = image.match(/url\(["']?([^"']*)["']?\)/);
                if (match === null || match === void 0 ? void 0 : match[1]) {
                    image = match[1];
                }
                else {
                    image = '';
                }
            }
            else {
                image = '';
            }
            const origin = $(element).find('.wine-card__region').text().trim();
            const rating = $(element).find('.average__number').text().trim();
            const price = $(element).find('.wine-price-value').text().trim();
            if (name && link && image && origin && rating && price) {
                results.push({
                    name,
                    link: `https://www.vivino.com${link}`,
                    image,
                    origin,
                    rating,
                    price,
                });
            }
        });
        console.log(`Scraped ${results.length} wines`); // Log the number of wines scraped
        return results;
    }
    catch (error) {
        console.error('Error scraping Vivino:', error);
        throw error;
    }
});
exports.scrapeVivino = scrapeVivino;
//# sourceMappingURL=vivinoScraper.js.map