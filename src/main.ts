import { createApp } from '@/server';
import dotenv from 'dotenv';

dotenv.config();

createApp().then((app) => {
  app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}.`);
  });
});
