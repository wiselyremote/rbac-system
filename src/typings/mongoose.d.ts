import mongoose, { Document, Model } from 'mongoose';

declare module 'mongoose' {
  interface IBaseDocument extends Document {
    _id: mongoose.Types.ObjectId;
  }

  type MongooseModel<T extends IBaseDocument> = Model<T>;
}
