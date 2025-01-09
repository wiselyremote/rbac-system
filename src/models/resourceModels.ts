import { bookingModel } from '@/models/booking.model';
import { userModel } from '@/models/user.model';

interface IResourceModels {
  [key: string]: any;
}

export const resourceModels: IResourceModels = {
  booking: bookingModel,
  user: userModel,
};
