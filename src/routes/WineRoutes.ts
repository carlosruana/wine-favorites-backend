import { Router } from 'express';
import multer from 'multer';
import { analyzeAndSaveImage, getHistory, getWineDetails, toggleFavorite, getFavorites, getWineByName, getWines, addWine, deleteWineFromHistory } from '../controllers/WineController';

const router = Router();

// Configurar multer para guardar archivos en el directorio 'uploads'
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
	  cb(null, 'uploads/');
	},
	filename: (req, file, cb) => {
	  cb(null, `${Date.now()}-${file.originalname}`);
	},
  });
  const upload = multer({ storage: storage });

router.get('/wines', getWines);
router.post('/wines', addWine);
router.get('/wines/:name', getWineByName); // Obtener un vino por nombre desde la base de datos
router.post('/wines/:id/favorite', toggleFavorite);
router.get('/favorites', getFavorites);
router.get('/history', getHistory);
router.post('/analyze', upload.single('image'), analyzeAndSaveImage);
router.get('/wines/details/:name', getWineDetails); // Obtener detalles del vino desde Vivino
router.delete('/history/:id', deleteWineFromHistory);

export default router;
