import { bookingModel } from '@/models/booking.model';
import { Entity } from '@/routes/entity.routes';
import { makeAllOptional } from '@/utils/validation.util';
import { z } from 'zod';

const getParams = {
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ObjectId'),
};

const createBody = {
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  owner: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid user ID'),
  poolUsers: z.array(z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID')).optional(),
  company: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid company ID'),
};

const updateBody = makeAllOptional(createBody);

const routesConfig = {
  get: {
    schema: {
      params: getParams,
    },
    action: 'booking:readBookings',
  },
  create: {
    schema: {
      body: createBody,
    },
    action: 'booking:createBookings',
  },
  update: {
    schema: {
      params: getParams,
      body: updateBody,
    },
    action: 'booking:updateBookings',
  },
  delete: {
    schema: {
      params: getParams,
    },
    action: 'booking:deleteBookings',
  },
};

export const bookingEntity: Entity = {
  name: 'booking',
  model: bookingModel,
  routesConfig,
};
