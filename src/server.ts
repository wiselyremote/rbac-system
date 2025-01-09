import { baseRouter } from '@/routes/base.routes';
import { mongooseService } from '@/services/mongoose.service';
import express from 'express';

export async function createApp() {
  await mongooseService.connect();

  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/', baseRouter);

  return app;
}
