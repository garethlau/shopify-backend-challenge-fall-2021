import {
  removeObject,
  removeObjects,
  putObject,
  getObject
} from '../src/s3/helper';
import s3Client from '../src/s3';

import fs from 'fs';
const S3_BUCKET_NAME = 'test-bucket';
const TEST_IMAGE_PATH = '__tests__/files/leslie-knope-1.jpg';
const FILE_NAME = 'leslie-knope';

describe('S3 helper functions', () => {
  beforeAll(async () => {
    const exists = await s3Client.bucketExists(S3_BUCKET_NAME);
    if (!exists) {
      await s3Client.makeBucket(S3_BUCKET_NAME, 'us-east-1');
    }
  });

  test('Store an object', (done) => {
    putObject(S3_BUCKET_NAME, FILE_NAME, TEST_IMAGE_PATH)
      .then((result) => {
        expect(typeof result).toBe('string');
        return done();
      })
      .catch(done);
  });

  test('Remove an object', (done) => {
    removeObject(S3_BUCKET_NAME, FILE_NAME)
      .then(() => {
        return done();
      })
      .catch(done);
  });

  test('Remove multiple objects', (done) => {
    const files = [
      { filename: FILE_NAME + '-1', file: TEST_IMAGE_PATH },
      { filename: FILE_NAME + '-2', file: TEST_IMAGE_PATH }
    ];

    const objectsList = files.map(({ filename }) => filename);

    Promise.all(
      files.map(({ filename, file }) =>
        s3Client.putObject(S3_BUCKET_NAME, filename, file)
      )
    ).then(() => {
      removeObjects(S3_BUCKET_NAME, objectsList).then(done).catch(done);
    });
  });

  test('Filename does not exist should error', (done) => {
    getObject(S3_BUCKET_NAME, 'does-not-exist').catch((err) => {
      expect(err).toEqual('No data stream');
      done();
    });
  });

  test('Get object', (done) => {
    s3Client.putObject(S3_BUCKET_NAME, FILE_NAME, TEST_IMAGE_PATH).then(() => {
      getObject(S3_BUCKET_NAME, FILE_NAME)
        .then((buf) => {
          fs.readFile(TEST_IMAGE_PATH, (_, sourceBuf) => {
            // compare buffers
            expect(Buffer.compare(sourceBuf, buf));
            return done();
          });
        })
        .catch(done);
    });
  });

  afterAll(async () => {
    await s3Client.removeBucket(S3_BUCKET_NAME);
  });
});
