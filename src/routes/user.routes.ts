import { userModel } from '@/models/user.model';
import { Entity } from '@/routes/entity.routes';
import { makeAllOptional } from '@/utils/validation.util';
import { z } from 'zod';

const getParams = {
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ObjectId'),
};

const createBody = {
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string(),
  company: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid company ID'),
  roles: z.array(z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid role ID')).optional(),
  policies: z.array(z.string()).optional(),
};

const updateBody = makeAllOptional(createBody);

const routesConfig = {
  get: {
    schema: {
      params: getParams,
    },
    action: 'user:readUsers',
  },
  create: {
    schema: {
      body: createBody,
    },
    action: 'user:createUsers',
  },
  update: {
    schema: {
      params: getParams,
      body: updateBody,
    },
    action: 'user:updateUsers',
  },
  delete: {
    schema: {
      params: getParams,
    },
    action: 'user:deleteUsers',
  },
};

export const userEntity: Entity = {
  name: 'user',
  model: userModel,
  routesConfig,
};
