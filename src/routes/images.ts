import { Router } from 'express';
import ImageModel from '../mongo/models/Image';
import { putObject, removeObjects } from '../s3/helper';
import multer from 'multer';
import sharp from 'sharp';
import { S3_BUCKET_NAME } from '../config';
import sizeOf from 'image-size';
import { parseSizes, parseTags } from '../utils/parser';

import variantsRouter from './variants';
import logger from '../utils/logger';
import validObjectId from '../middleware/validObjectId';

const upload = multer();
const router = Router();

router.use('/:imageId/variants', variantsRouter);

// Get all images
router.get('/', async (req, res) => {
  try {
    const images = await ImageModel.find().exec();
    res.send({ images });
  } catch (error) {
    return res.status(500).send();
  }
});

// Get a single image
router.get('/:imageId', validObjectId('imageId'), async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await ImageModel.findById(imageId).exec();
    if (!image) {
      return res.status(404).send({ message: 'Image not found.' });
    }
    return res.status(200).send({ image });
  } catch (error) {
    logger.error;
    return res.status(500).send();
  }
});

// Upload new images
router.post('/', upload.single('image'), async (req, res) => {
  const file = req.file;

  let sizes: number[][];
  try {
    sizes = parseSizes(req);
  } catch (error) {
    return res.status(400).send({ message: error });
  }
  const tags = parseTags(req);

  const [name] = file.originalname.split('.');

  try {
    const { width: originalWidth, height: originalHeight } = sizeOf(
      file.buffer
    );
    sizes.push([originalWidth, originalHeight]);
  } catch (error) {
    return res.status(415).send({ message: error });
  }

  // save source image
  await putObject(S3_BUCKET_NAME, file.originalname, file.buffer);

  // Generate images for requested sizes and source size
  const promises = sizes.map(
    ([width, height]) =>
      new Promise(async (resolve, reject) => {
        // resize the image
        sharp(file.buffer)
          .jpeg({ quality: 80 })
          .resize(width, height)
          .toBuffer()
          .then((resizedBuffer) => {
            // create file name
            const filename = `${name}_${width}x${height}.jpg`;

            // save the image
            putObject(S3_BUCKET_NAME, filename, resizedBuffer)
              .then(() => {
                resolve(filename);
              })
              .catch(reject);
          });
      })
  );

  const variants = await Promise.all(promises);

  // save to mongodb
  const image = await new ImageModel({
    src: file.originalname,
    variants,
    tags
  }).save();

  return res.status(200).send({ message: '', image });
});

// Delete an image
router.delete('/:imageId', async (req, res) => {
  const { imageId } = req.params;
  try {
    const image = await ImageModel.findById(imageId).exec();

    // remove images from s3
    const objectsList = [...image.variants, image.src];

    await removeObjects(S3_BUCKET_NAME, objectsList);

    // delete document
    await image.delete();

    return res.status(200).send({ message: 'Image successfully deleted.' });
  } catch (error) {
    return res.status(500).send();
  }
});

// Update an image
router.patch('/:imageId', async (req, res) => {
  const { imageId } = req.params;

  try {
    const image = await ImageModel.findById(imageId).exec();
    // TODO - Update image properties
    return res.status(200).send({ image });
  } catch (error) {
    return res.status(500).send();
  }
});

export default router;
