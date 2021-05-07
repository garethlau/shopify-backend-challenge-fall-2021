import { PORT } from './config';
import logger from './utils/logger';
import initDb from './mongo/init';

import app from './app';

(async function () {
  try {
    await initDb();
    logger.info('Successfully connected to mongo');
  } catch (error) {
    logger.error('Error connecting to mongo ', error);
    return;
  }

  app.listen(PORT, () => {
    logger.info(`Listening on port: ${PORT}`);
  });
})();
