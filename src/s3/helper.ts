import s3Client from './index';

// wrapper around mino client putObject method to return promise
function removeObject(bucketName: string, objectName: string): Promise<null> {
  return new Promise((resolve, reject) => {
    s3Client.removeObject(bucketName, objectName, (error) => {
      if (error) reject(error);
      resolve(null);
    });
  });
}

// wrapper around mino client putObjects method to return promise
function removeObjects(
  bucketName: string,
  objectsList: string[]
): Promise<null> {
  return new Promise((resolve, reject) => {
    s3Client.removeObjects(bucketName, objectsList, (error) => {
      if (error) reject(error);
      resolve(null);
    });
  });
}

function putObject(
  bucketName: string,
  objectName: string,
  stream: Buffer | string
): Promise<string> {
  return new Promise((resolve, reject) => {
    s3Client.putObject(bucketName, objectName, stream, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });
}

// wrapepr around mino client getObject method to return promise buffer
function getObject(bucketName: string, objectName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    s3Client.getObject(bucketName, objectName, (error, dataStream) => {
      const chunks: Uint8Array[] = [];
      if (error) reject(error);
      dataStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
      dataStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
      dataStream.on('error', (error) => {
        reject(error);
      });
    });
  });
}

export { putObject, removeObject, removeObjects, getObject };
