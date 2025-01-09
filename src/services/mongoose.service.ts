import mongoose from 'mongoose';

class MongooseService {
  async connect() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rbac');
    console.log('Database connected');
  }
}

export const mongooseService = new MongooseService();
