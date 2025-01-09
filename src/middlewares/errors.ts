import { BadRequestError } from '@/errors/bad-request';
import { InternalError } from '@/errors/internal';
import { NotFoundError } from '@/errors/not-found';
import { UnauthenticatedError } from '@/errors/unauthenticated';
import { UnauthorizedError } from '@/errors/unauthorized';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { isNil, omitBy } from 'lodash-es';

// Function to resolve the HTTP status code based on the error type
function resolveStatusCode(error: Error) {
  switch (true) {
    case error instanceof BadRequestError: return StatusCodes.BAD_REQUEST;
    case error instanceof NotFoundError: return StatusCodes.NOT_FOUND;
    case error instanceof UnauthenticatedError: return StatusCodes.UNAUTHORIZED;
    case error instanceof UnauthorizedError: return StatusCodes.FORBIDDEN;
    case error instanceof InternalError: return StatusCodes.INTERNAL_SERVER_ERROR;
    default: return StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

// Express error-handling middleware

export const handleErrors = (error: any) => {
  return (request: Request, response: Response) => {
    console.log(response);

    const statusCode = resolveStatusCode(error);
    const errorIsInternal = statusCode === StatusCodes.INTERNAL_SERVER_ERROR;
    const message = (!errorIsInternal && error.message) || 'Internal error.';
    if (!response.headersSent) {
      const responseBody = omitBy({
        message,
        code: error.errorCode,
      }, isNil);

      response
        .status(statusCode)
        .json(responseBody);
    }
  };
};

// Middleware to handle "Not Found" errors (when no route matches)
export const handleNotFound = () => {
  return (request: Request, response: Response) => {
    response
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Route not found.' });
  };
};
