import mongoose, { Schema, IBaseDocument, MongooseModel } from 'mongoose';

export interface ICompany extends IBaseDocument {
  name: string;
  description?: string;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
);

export const companyModel: MongooseModel<ICompany> = mongoose.model<ICompany>('Company', companySchema);
