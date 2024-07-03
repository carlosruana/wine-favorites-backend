import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5001;

// Log environment variables to verify they are loaded
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
