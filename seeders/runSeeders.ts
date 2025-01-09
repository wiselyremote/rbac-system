import { seedData } from '@/seedData';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const runSeeders = async () => {
  try {
    console.log('Connecting to the database...');
    await mongoose.connect(process.env.MONGO_URI_SEEDERS);

    console.log('Running seeders...');
    await seedData();
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
};

await runSeeders();
