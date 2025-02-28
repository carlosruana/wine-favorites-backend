import axios from 'axios';
import { load } from 'cheerio';

export const scrapeVivino = async (wineName: string) => {
  const url = `https://www.vivino.com/search/wines?q=${encodeURIComponent(wineName)}`;
  
  try {
    const { data } = await axios.get(url);
	console.log(load);
    const $ = load(data);
    
    const results: Array<{
      name: string;
      link: string;
      image: string;
      origin: string;
      rating: string;
      price: string;
    }> = [];

    // Usar el selector actualizado para las tarjetas de vino
    $('.search-results-list .default-wine-card').each((_, element) => {
      const name = $(element).find('.wine-card__name').text().trim();
      const link = $(element).find('.wine-card__name a').attr('href') || '';
      
      // Obtener la URL de la imagen desde el estilo 'background-image'
      let image = $(element).find('.wine-card__image').css('background-image');
      if (typeof image === 'string') {
        // Extraer la URL de la imagen del estilo 'background-image'
        const match = image.match(/url\(["']?([^"']*)["']?\)/);
        if (match?.[1]) {
          image = match[1];
        } else {
          image = '';
        }
      } else {
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
  } catch (error) {
    console.error('Error scraping Vivino:', error);
    throw error;
  }
};
