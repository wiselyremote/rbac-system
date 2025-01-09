import { companyModel } from '@/models/company.model';
import { policyModel, IPolicy } from '@/models/policy.model';
import { resourceModels } from '@/models/resourceModels'; // Import the resource mapping file
import { roleModel } from '@/models/role.model';
import { userModel } from '@/models/user.model';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export interface IRequest extends Request {
  user?: { userId: string; company: string; roles: string[] };
}

// Utility function to extract the resource type from the action (e.g., "user", "booking")
const getResourceTypeFromAction = (action: string): string | null => {
  const actionParts = action.split(':');
  if (actionParts.length > 1) {
    return actionParts[0]; // The prefix before ":" defines the resource type
  }
  return null;
};

// Utility function to get the correct Mongoose model based on the resource type
const getModelForResourceType = (resourceType: string) => {
  return resourceModels[resourceType]; // Lookup the model associated with the resource type
};

export const checkPermissions = (action: string) => {
  return async (request: IRequest, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Retrieve the user from the request (assumed to be authenticated)
      const userId = request.user?.userId;
      if (!userId) {
        response
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'User is not authenticated' });
        return;
      }

      const user = await userModel.findById(userId);
      if (!user) {
        response
          .status(StatusCodes.NOT_FOUND)
          .json({ error: 'Authenticated user not found in the database' });
        return;
      }

      let resource;
      let resourceId: string;
      console.log('HELLO');

      if (request.method !== 'POST') {
        resourceId = request.params.id; // ID of the resource or user being accessed
        if (!resourceId) {
          response
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Resource ID (resource or user) is missing in the request' });
          return;
        }

        // Dynamically extract the resource type from the action
        const resourceType = getResourceTypeFromAction(action);
        if (!resourceType) {
          response
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Invalid action format' });
          return;
        }

        // Retrieve the correct Mongoose model for the resource type
        const resourceModel = getModelForResourceType(resourceType);
        if (!resourceModel) {
          response
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: `Invalid resource type: ${resourceType}` });
          return;
        }

        // Check if the resource belongs to the same company as the user
        resource = await resourceModel.findById(resourceId);
        if (!resource) {
          response
            .status(StatusCodes.NOT_FOUND)
            .json({ error: `${resourceType} not found` });
          return;
        }
      }

      // Verify that the user belongs to the same company as the resource
      const company = await companyModel.findById(user.company);
      if (!company) {
        response
          .status(StatusCodes.NOT_FOUND)
          .json({ error: 'Company associated with the user not found' });
        return;
      }

      const companyToTest = request.method === 'POST'
        ? request.body.company
        : (resource ? resource.company : null);

      // Compare the company of the resource and the user
      console.log('companyToTest', companyToTest);
      console.log('user.company.toString()', user.company.toString());
      if (companyToTest.toString() !== user.company.toString()) {
        response
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Resource does not belong to the same company' });
        return;
      }

      // Retrieve all roles associated with the user
      const roles = await roleModel.find({ _id: { $in: user.roles } });

      // Retrieve policies from roles
      let rolePolicies: IPolicy[] = [];
      for (const role of roles) {
        const rolePoliciesFromDB = await policyModel.find({ _id: { $in: role.policies } });
        rolePolicies = rolePolicies.concat(rolePoliciesFromDB);
      }

      // Retrieve direct policies assigned to the user
      const directPolicies = await policyModel.find({ _id: { $in: user.policies } });

      // Combine role-based policies and direct user policies
      const allPolicies = rolePolicies.concat(directPolicies);

      // Check if the user has any policies (from roles or directly) that allow the action
      const hasPermission = allPolicies.some((policy: IPolicy) => {
        // Check if the policy allows the action
        if (policy.actions.includes(action)) {
          // Check if the policy applies to the specified resource or all resources ("*")
          if (action.includes('create') || policy.resources.includes(resourceId) || policy.resources.includes('*')) {
            return true; // Permission granted
          }
        }
        return false; // No matching policy found
      });

      if (!hasPermission) {
        response
          .status(StatusCodes.FORBIDDEN)
          .json({ error: 'You do not have permission to perform this action' });
        return;
      }
      next();
    } catch (error) {
      console.error('Error checking permissions:', error);
      response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error' });
      return;
    }
  };
};
