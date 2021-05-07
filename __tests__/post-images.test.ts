import request from 'supertest';
import app from '../src/app';
import initDb from '../src/mongo/init';

const BASE_URL = '/api/images';
const TEST_IMAGE_PATH = '__tests__/files/leslie-knope-1.jpg';

describe('Upload an image', () => {
  beforeAll(async () => {
    await initDb();
  });

  test('without creating variants', (done) => {
    request(app)
      .post(BASE_URL)
      .attach('image', TEST_IMAGE_PATH)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).toHaveProperty('image');
        return done(err);
      });
  });

  test('create a single 300x300 variant', (done) => {
    request(app)
      .post(BASE_URL)
      .field('sizes', '300x300')
      .attach('image', TEST_IMAGE_PATH)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.image).toHaveProperty('variants');
        expect(res.body.image.variants.length).toEqual(2);
        return done();
      });
  });

  test('create 2 variants of size 100x100 and 200x200', (done) => {
    request(app)
      .post(BASE_URL)
      .field('sizes', '100x100,200x200')
      .attach('image', TEST_IMAGE_PATH)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.image).toHaveProperty('variants');
        expect(res.body.image.variants.length).toEqual(3);
        return done();
      });
  });

  test('label the image with 3 tags', (done) => {
    const tags = 'leslie knope,parks and rec,p&r';
    request(app)
      .post(BASE_URL)
      .field('tags', tags)
      .attach('image', TEST_IMAGE_PATH)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.image).toHaveProperty('tags');
        expect(res.body.image.tags.length).toEqual(3);
        return done();
      });
  });

  test('invalid size input should fail - 400 malformed', (done) => {
    request(app)
      .post(BASE_URL)
      .field('sizes', 'abcx123')
      .attach('image', TEST_IMAGE_PATH)
      .expect(400, done);
  });

  test('missing height value in size should fail - 400 malformed', (done) => {
    request(app)
      .post(BASE_URL)
      .field('sizes', '100')
      .attach('image', TEST_IMAGE_PATH)
      .expect(400, done);
  });

  test('a single invalid size input should fail - 400 malformed', (done) => {
    request(app)
      .post(BASE_URL)
      .field('sizes', '100x100,200x200,awdxawd')
      .attach('image', TEST_IMAGE_PATH)
      .expect(400, done);
  });

  test('invalid file should fail', (done) => {
    request(app)
      .post(BASE_URL)
      .attach('image', '__tests__/files/text-file.txt')
      .expect(415, done);
  });
});
