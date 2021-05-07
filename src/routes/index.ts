import express from 'express';
import imagesRoutes from './images';

const router = express.Router();

router.use('/images', imagesRoutes);

export default router;
