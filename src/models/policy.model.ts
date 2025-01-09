import mongoose, { Schema, IBaseDocument, MongooseModel } from 'mongoose';

export interface IPolicy extends IBaseDocument {
  name: string;
  effect: string;
  actions: string[];
  resources: string[];
}

const policySchema = new Schema<IPolicy>(
  {
    name: { type: String, required: true },
    effect: { type: String, required: true },
    actions: [{ type: String, required: true }],
    resources: [{ type: String }],
  },
);

export const policyModel: MongooseModel<IPolicy> = mongoose.model<IPolicy>('Policy', policySchema);
