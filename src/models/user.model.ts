import { ICompany } from '@/models/company.model';
import { IPolicy } from '@/models/policy.model';
import { IRole } from '@/models/role.model';
import bcrypt from 'bcrypt';
import mongoose, { Schema, IBaseDocument, MongooseModel, Types, CallbackError } from 'mongoose';

export interface IUser extends IBaseDocument {
  name: string;
  email: string;
  password: string;
  company: Types.ObjectId | ICompany;
  roles: Types.ObjectId[] | IRole[];
  policies: Types.ObjectId[] | IPolicy[];
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: Types.ObjectId, ref: 'Company', required: true },
  roles: [{ type: Types.ObjectId, ref: 'Role' }],
  policies: [{ type: Types.ObjectId, ref: 'Policy' }],
});

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
  const user = this as IUser;

  // Only hash the password if it's new or modified
  if (!user.isModified('password')) return next();

  try {
    // Hash the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(error as CallbackError);
    } else {
      next(new Error('Unknown error occurred during password hashing') as CallbackError);
    }
  }
});

// Method to validate the password
userSchema.methods.isValidPassword = async function (password: string): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(password, user.password);
};

export const userModel: MongooseModel<IUser> = mongoose.model<IUser>('User', userSchema);
