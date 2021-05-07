import { Router } from 'express';
import ImageModel from '../mongo/models/Image';
import { S3_BUCKET_NAME } from '../config';
import { removeObject, getObject, putObject } from '../s3/helper';
import sharp from 'sharp';
import { parseSizes } from '../utils/parser';

const router = Router({ mergeParams: true });

router.post('/', async (req, res) => {
  const { imageId } = req.params;
  const sizes = parseSizes(req);

  if (!sizes) {
    return res.status(400).send({ message: 'Specify sizes.' });
  }

  try {
    // get existing image document
    const image = await ImageModel.findById(imageId).exec();

    const [name] = image.src.split('.');

    // get the source image
    const buffer = await getObject(S3_BUCKET_NAME, image.src);

    // create new sizes
    const promises: Promise<string>[] = sizes.map(
      ([width, height]) =>
        new Promise((resolve, reject) => {
          // resize image
          sharp(buffer)
            .jpeg({ quality: 80 })
            .resize(width, height)
            .toBuffer()
            .then((resizedBuffer) => {
              // create file name
              const filename = `${name}_${width}x${height}.jpg`;

              // save image
              putObject(S3_BUCKET_NAME, filename, resizedBuffer)
                .then(() => {
                  resolve(filename);
                })
                .catch(reject);
            });
        })
    );

    const newVariants = await Promise.all(promises);

    // save to mongo
    image.variants = [...image.variants, ...newVariants];
    const updatedImage = await image.save();

    // return updated image document
    return res.status(200).send({ image: updatedImage });
  } catch (error) {}
});

router.delete('/:variantName', async (req, res) => {
  const { imageId, variantName } = req.params;
  try {
    const image = await ImageModel.findById(imageId).exec();

    await removeObject(S3_BUCKET_NAME, variantName);

    image.variants = image.variants.filter(
      (variant) => variant !== variantName
    );

    const updatedImage = await image.save();

    return res.status(200).send({ image: updatedImage });
  } catch (error) {
    return res.status(500).send();
  }
});

export default router;
