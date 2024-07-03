import { Router } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { 
    getWines, addWine, getWineByName, toggleFavorite, 
    getFavorites, getHistory, analyzeAndSaveImage, 
    getWineDetails, deleteWineFromHistory 
} from '../controllers/WineController';

const router = Router();

// Configure AWS SDK S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

// Ensure that the S3_BUCKET_NAME environment variable is defined
const s3BucketName = process.env.S3_BUCKET_NAME;
if (!s3BucketName) {
    throw new Error('S3_BUCKET_NAME environment variable is not defined');
}

// Configure multer to use S3 for file storage
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: s3BucketName,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `${Date.now().toString()}-${file.originalname}`);
        }
    })
});

// Define routes
router.get('/wines', getWines);
router.post('/wines', addWine);
router.get('/wines/:name', getWineByName);
router.post('/wines/:id/favorite', toggleFavorite);
router.get('/favorites', getFavorites);
router.get('/history', getHistory);
router.post('/analyze', upload.single('image'), analyzeAndSaveImage);
router.get('/wines/details/:name', getWineDetails);
router.delete('/history/:id', deleteWineFromHistory);

export default router;
