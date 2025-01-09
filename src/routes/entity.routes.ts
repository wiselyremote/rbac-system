import { authenticate } from '@/middlewares/auth';
import { checkPermissions, IRequest } from '@/middlewares/permission';
import { Router, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { compact, mapValues } from 'lodash-es';
import { Model } from 'mongoose';
import { z, ZodTypeAny } from 'zod';
import { validateRequest } from 'zod-express-middleware';

interface RoutesConfig {
  get: {
    schema: {
      params: {
        id: ZodTypeAny;
      };
    };
    action?: string;
  };
  create: {
    schema: {
      body: Record<string, ZodTypeAny>;
    };
    action?: string;
  };
  update: {
    schema: {
      params: {
        id: ZodTypeAny;
      };
      body: Record<string, ZodTypeAny>;
    };
    action?: string;
  };
  delete: {
    schema: {
      params: {
        id: ZodTypeAny;
      };
    };
    action?: string;
  };
};

export interface Entity {
  name: string;
  model: Model<any>;
  routesConfig?: RoutesConfig;
  setup?: (router: Router) => void;
};

interface Route {
  path: string;
  method: string;
  schema?: Record<string, ZodTypeAny>;
  action?: string;
  handler: any;
}

// Function to register routes for an entity
export function registerRoutes(router: Router, options: Entity) {
  const {
    name,
    model,
    routesConfig,
    setup,
  } = options;

  const prefix = `${name}s`;

  // Helper function to convert the schema to strict object schema
  const resolveSchema = function (options: Record<string, Record<string, ZodTypeAny>>) {
    return mapValues(options, (option) => z.strictObject(option));
  };

  // Helper function to check if a route already exists in the router
  const routeExists = (router: Router, path: string, method: string) => {
    return router.stack.some((layer: any) => {
      if (layer.route) {
        const routePath = layer.route.path;
        const routeMethods = layer.route.methods;
        return routePath === path && routeMethods[method.toLowerCase()]; // Check if route already exists
      }
      return false;
    });
  };

  // Helper function to add a unique route to the router
  const addUniqueRoute = (route: Route) => {
    if (!routeExists(router, route.path, route.method)) {
      const middlewares: any[] = compact([
        authenticate(),
        route.schema ? validateRequest(route.schema) : null, // Add schema validation middleware if needed
        route.action ? checkPermissions(route.action) : null, // Add permission check middleware if needed
      ]);

      router[route.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'](
        route.path,
        middlewares,
        route.handler,
      );
    }
  };

  // Optional setup function to allow further customization of the router
  setup?.(router);

  // Register the GET route for retrieving an entity by ID
  addUniqueRoute({
    method: 'GET',
    path: `/${prefix}/:id`,
    schema: routesConfig?.get?.schema && (
      resolveSchema(routesConfig.get?.schema)
    ),
    action: routesConfig?.get?.action,
    handler: async (request: IRequest, response: Response) => {
      const entity = await model.findById(request.params.id);
      if (!entity) {
        response.status(StatusCodes.NOT_FOUND).json({ message: `${name} not found` });
        return;
      }
      response.json(entity);
    },
  });

  // Register the POST route for creating a new entity
  addUniqueRoute({
    method: 'POST',
    path: `/${prefix}`,
    schema: routesConfig?.create?.schema && (
      resolveSchema(routesConfig.create?.schema)
    ),
    action: routesConfig?.create?.action,
    handler: async (request: IRequest, response: Response) => {
      const entity = await model.create(request.body);
      response
        .location(`${prefix}/${entity.id}`)
        .status(StatusCodes.CREATED)
        .send();
    },
  });

  // Register the PATCH route for updating an entity by ID
  addUniqueRoute({
    method: 'PATCH',
    path: `/${prefix}/:id`,
    schema: routesConfig?.update?.schema && (
      resolveSchema(routesConfig.update?.schema)
    ),
    action: routesConfig?.get?.action,
    handler: async (request: IRequest, response: Response) => {
      const entity = await model.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true },
      );
      if (!entity) {
        response.status(StatusCodes.NOT_FOUND).json({ message: `${name} not found` });
        return;
      }
      response.json(entity);
    },
  });

  // Register the DELETE route for deleting an entity by ID
  addUniqueRoute({
    method: 'DELETE',
    path: `/${prefix}/:id`,
    schema: routesConfig?.delete?.schema && (
      resolveSchema(routesConfig.delete?.schema)
    ),
    action: routesConfig?.get?.action,
    handler: async (request: IRequest, response: Response): Promise<void> => {
      await model.findByIdAndDelete(request.params.id);
      response
        .status(StatusCodes.NO_CONTENT)
        .send();
    },
  });
}
