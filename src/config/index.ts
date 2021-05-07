import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'minio';
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'minio123';
export const S3_END_POINT = process.env.S3_END_POINT || 'localhost';
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'images';
