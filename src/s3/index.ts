import { Client } from 'minio';
import { S3_ACCESS_KEY, S3_SECRET_KEY, S3_END_POINT } from '../config';
import logger from '../utils/logger';

const s3Client = new Client({
  endPoint: S3_END_POINT,
  port: 9000,
  accessKey: S3_ACCESS_KEY,
  secretKey: S3_SECRET_KEY,
  useSSL: false
});

(async function () {
  const exists = await s3Client.bucketExists('images');
  if (!exists) {
    logger.info('Creating new bucket');
    s3Client.makeBucket('images', 'us-east-1', (error) => {
      if (error) {
        logger.error(error);
      }
    });
  }
})();

export default s3Client;
