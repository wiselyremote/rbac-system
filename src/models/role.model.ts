import { ICompany } from '@/models/company.model';
import { IPolicy } from '@/models/policy.model';
import mongoose, { Schema, IBaseDocument, MongooseModel, Types } from 'mongoose';

export interface IRole extends IBaseDocument {
  name: string;
  company: Types.ObjectId | ICompany;
  policies: Types.ObjectId[] | IPolicy[];
}

const roleSchema = new Schema<IRole>({
  name: { type: String, required: true },
  company: { type: Types.ObjectId, ref: 'Company', required: true },
  policies: [{ type: Types.ObjectId, ref: 'Policy' }],
});

export const roleModel: MongooseModel<IRole> = mongoose.model<IRole>('Role', roleSchema);
