import { IRequest } from '@/middlewares/permission';
import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  company: string;
  roles: string[];
}

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';

export const authenticate = () => {
  return async (request: IRequest, response: Response, next: NextFunction): Promise<void> => {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      response
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Authorization header is missing' });
      return;
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    if (!token) {
      response
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Token is missing' });
      return;
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      (request as IRequest).user = {
        userId: decoded.userId,
        company: decoded.company,
        roles: decoded.roles,
      }; // Attach the decoded user information to the request object
      next(); // Proceed to the next middleware/handler
    } catch (error) {
      console.error('JWT verification failed:', error);
      response
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Invalid or expired token' });
      return;
    }
  };
};
