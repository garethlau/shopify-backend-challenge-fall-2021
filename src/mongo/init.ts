import mongoose from 'mongoose';
import { MONGO_URL } from '../config';

export default function init(): Promise<null> {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      MONGO_URL,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false
      },
      (error) => {
        if (error) {
          reject(error);
        }
        resolve(null);
      }
    );
  });
}
