import express from 'express';
import cors from 'cors';

import morgan from 'morgan';
import routes from './routes';
const whitelist = ['http://localhost:3000'];
const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by cors`));
      }
    },
    credentials: true
  })
);

app.use(morgan('tiny'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);

export default app;
