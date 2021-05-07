import { Model, model, Document, Schema } from 'mongoose';

import { Image } from '../../interfaces/Image';

interface ImageDocument extends Image, Document {}

const ImageSchema = new Schema({
  src: String,
  variants: [String],
  tags: [String]
});

const ImageModel: Model<ImageDocument> = model<ImageDocument>(
  'Image',
  ImageSchema
);

export { ImageModel, ImageSchema };
export default ImageModel;
