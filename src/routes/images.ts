import { Router } from 'express';
import ImageModel from '../mongo/models/Image';
import { putObject, removeObjects } from '../s3/helper';
import multer from 'multer';
import sharp from 'sharp';
import { S3_BUCKET_NAME } from '../config';
import sizeOf from 'image-size';
import { parseSizes, parseTags } from '../utils/parser';
import { Image } from '../interfaces/Image';
import variantsRouter from './variants';
import validObjectId from '../middleware/validObjectId';
import { FilterQuery } from 'mongoose';

const upload = multer();
const router = Router();

router.use('/:imageId/variants', variantsRouter);

// Get all images
router.get('/', async (req, res, next) => {
  const rawSearch = req.query.search;

  const query: FilterQuery<Image> = {};

  if (rawSearch && rawSearch !== ' ') {
    const search = req.query.search?.toString();
    // parse tags from search
    const tags = search.split(',').filter((tag) => tag && tag !== ' ');

    // filter images by tags
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }
  }

  try {
    const images = await ImageModel.find(query).exec();
    return res.send({ images });
  } catch (error) {
    return next(error);
  }
});

// Get a single image
router.get('/:imageId', validObjectId('imageId'), async (req, res, next) => {
  try {
    const { imageId } = req.params;
    const image = await ImageModel.findById(imageId).exec();
    if (!image) {
      return res.status(404).send({ message: 'Image not found.' });
    }
    return res.status(200).send({ image });
  } catch (error) {
    return next(error);
  }
});

// Upload new images
router.post('/', upload.single('image'), async (req, res, next) => {
  const file = req.file;
  const skipCopy: boolean = req.body.skipCopy;

  let sizes: number[][];
  try {
    sizes = parseSizes(req);
  } catch (error) {
    return res.status(400).send({ message: error });
  }
  const tags = parseTags(req);

  const [name] = file.originalname.split('.');

  try {
    // regardless of skipCopy, attempt to calculate the dimensions of the image to ensure image format
    const { width: originalWidth, height: originalHeight } = sizeOf(
      file.buffer
    );
    if (!skipCopy) {
      sizes.push([originalWidth, originalHeight]);
    }
  } catch (error) {
    return res.status(415).send({ message: error });
  }

  try {
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
  } catch (error) {
    return next(error);
  }
});

// Delete an image
router.delete('/:imageId', async (req, res, next) => {
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
    return next(error);
  }
});

// Update an image
router.patch('/:imageId', validObjectId('imageId'), async (req, res, next) => {
  const { imageId } = req.params;
  const rawTags: string = req.body.tags;

  // object to execute update against
  const updateQuery: Partial<Image> = {};

  if (rawTags && rawTags !== ' ') {
    const tags = rawTags.split(',').filter((tag) => tag && tag !== ' ');
    if (tags.length > 0) {
      // only override tags if provided with values
      updateQuery.tags = tags;
    }
  }

  try {
    const updatedImage = await ImageModel.findByIdAndUpdate(
      imageId,
      updateQuery,
      {
        new: true
      }
    ).exec();
    return res.status(200).send({ image: updatedImage });
  } catch (error) {
    return next(error);
  }
});

export default router;
