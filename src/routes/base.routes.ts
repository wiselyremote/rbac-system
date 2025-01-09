import { bookingEntity } from '@/routes/booking.routes';
import { registerRoutes } from '@/routes/entity.routes';
import { loginRouter } from '@/routes/login.routes';
import { userEntity } from '@/routes/user.routes';
import express from 'express';

const entities = [
  userEntity,
  bookingEntity,
];

// Create the base router for handling all routes
const baseRouter = express.Router();

baseRouter.use(loginRouter);

// Iterate over the entities array and register each entity's routes
entities.forEach((entity) => {
  const router = express.Router();
  registerRoutes(router, entity);
  baseRouter.use(router);
});

export { baseRouter };
