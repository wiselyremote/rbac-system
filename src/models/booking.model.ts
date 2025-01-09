import { ICompany } from '@/models/company.model';
import { IUser } from '@/models/user.model';
import mongoose, { Schema, IBaseDocument, MongooseModel, Types } from 'mongoose';

export interface IBooking extends IBaseDocument {
  name: string;
  description?: string;
  owner: Types.ObjectId | IUser;
  poolUsers: Types.ObjectId[] | IUser[];
  company: Types.ObjectId | ICompany;
}

const bookingSchema = new Schema<IBooking>({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  poolUsers: [{ type: Types.ObjectId, ref: 'User', default: [] }],
  company: { type: Types.ObjectId, required: true },
});

export const bookingModel: MongooseModel<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);
