import { bookingModel } from '@/models/booking.model';
import { companyModel } from '@/models/company.model';
import { policyModel } from '@/models/policy.model';
import { roleModel } from '@/models/role.model';
import { userModel } from '@/models/user.model';

export const seedData = async () => {
  try {
    // Check if companies already exist
    let companies = await companyModel.find();
    if (companies.length === 0) {
      companies = await companyModel.create([
        { name: 'Company A', description: 'Company A' },
        { name: 'Company B', description: 'Company B' },
        { name: 'Company C', description: 'Company C' },
        { name: 'Company D', description: 'Company D' },
      ]);
      console.log('Companies seeded');
    }

    // Check if users already exist
    let users = await userModel.find();
    if (users.length === 0) {
      users = await userModel.create([
        {
          name: 'Manager Company A',
          email: 'manager.companyA@example.com',
          password: 'password',
          company: companies[0]._id,
        },
        {
          name: 'User Company A',
          email: 'user.companyA@example.com',
          password: 'password',
          company: companies[0]._id,
        },
        {
          name: 'User Company B',
          email: 'user.companyB@example.com',
          password: 'password',
          company: companies[1]._id,
        },
        {
          name: 'Manager Company B',
          email: 'manager.companyB@example.com',
          password: 'password',
          company: companies[1]._id,
        },
        {
          name: 'User Company C',
          email: 'user.companyC@example.com',
          password: 'password',
          company: companies[2]._id,
        },
      ]);
      console.log('Users seeded');
    }

    // Check if roles already exist
    let roles = await roleModel.find();
    if (roles.length === 0) {
      roles = await roleModel.create([
        {
          name: 'Manager',
          company: companies[0]._id,
          policies: [], // Policies will be added later
        },
        {
          name: 'User',
          company: companies[0]._id,
          policies: [], // Policies will be added later
        },
        {
          name: 'Manager',
          company: companies[1]._id,
          policies: [], // Policies will be added later
        },
        {
          name: 'User',
          company: companies[1]._id,
          policies: [], // Policies will be added later
        },
      ]);
      console.log('Roles seeded');
    }

    // Check if policies already exist
    let policies = await policyModel.find();
    if (policies.length === 0) {
      policies = await policyModel.create([
        {
          name: 'Policy 1',
          effect: 'Allow',
          actions: ['user:readUsers', 'user:createUsers'],
          resources: ['*'], // Actions related to user management
        },
        {
          name: 'Policy 2',
          effect: 'Allow',
          actions: ['booking:readBookings', 'booking:createBookings'],
          resources: ['*'], // Actions related to booking management
        },
        {
          name: 'Manage Users Policy',
          effect: 'Allow',
          actions: ['user:updateUsers', 'user:deleteUsers'],
          resources: ['*'], // Apply to all users
        },
        {
          // New Policy: Directly assign to a specific user and resource (Booking)
          name: 'Specific Booking Access',
          effect: 'Allow',
          actions: ['booking:readBookings'],
          resources: [], // Will be populated with booking IDs dynamically
        },
      ]);
      console.log('Policies seeded');
    }

    // Check if bookings already exist
    let bookings = await bookingModel.find();
    if (bookings.length === 0) {
      bookings = await bookingModel.create([
        {
          name: 'Booking 1',
          description: 'Booking for Manager of Company A',
          owner: users[0]._id, // Manager
          poolUsers: [users[0]._id], // Only the Manager in the pool
          company: companies[0]._id,
        },
        {
          name: 'Booking 2',
          description: 'Booking for User of Company A',
          owner: users[1]._id, // User from Company A
          poolUsers: [users[1]._id], // Only the user in the pool
          company: companies[0]._id,
        },
        {
          name: 'Booking 3',
          description: 'Booking for Manager of Company B',
          owner: users[3]._id, // Manager from Company B
          poolUsers: [users[3]._id], // Only the Manager in the pool
          company: companies[1]._id,
        },
        {
          name: 'Booking 4',
          description: 'Booking for User of Company B',
          owner: users[2]._id, // User from Company B
          poolUsers: [users[2]._id], // Only the user in the pool
          company: companies[1]._id,
        },
      ]);
      console.log('Bookings seeded');
    }

    // Assign "Specific Booking Access" policy to a user (User from Company A) with a specific booking resource (Booking 2)
    const specificBookingPolicy = policies.find((policy) => policy.name === 'Specific Booking Access');
    if (specificBookingPolicy && bookings.length > 1) {
      const bookingId = bookings[1]._id.toString(); // ID of 'Booking 2'

      // Assign this policy to the user (user.companyA@example.com) and reference the booking resource
      specificBookingPolicy.resources = [bookingId]; // Add the specific booking ID to the resources array
      await specificBookingPolicy.save(); // Save the updated policy

      const user = users[1]; // Example: 'User Company A'
      user.policies = [...user.policies, specificBookingPolicy._id]; // Add the policy to the user's policies list
      await user.save(); // Save the user with the new policy

      console.log('Specific Booking Access policy assigned to User Company A for Booking 2');
    }

    // Assign roles to users and attach policies to roles
    const policy1 = policies.find((policy) => policy.name === 'Policy 1');
    const managerPolicy = policies.find((policy) => policy.name === 'Manage Users Policy');

    const managerRoleCompanyA = roles.find((role) => role.name === 'Manager' && role.company.toString() === companies[0]._id.toString());
    const userRoleCompanyA = roles.find((role) => role.name === 'User' && role.company.toString() === companies[0]._id.toString());
    const managerRoleCompanyB = roles.find((role) => role.name === 'Manager' && role.company.toString() === companies[1]._id.toString());

    const userCompanyA = users.find((user) => user.email === 'user.companyA@example.com');
    const managerCompanyA = users.find((user) => user.email === 'manager.companyA@example.com');
    const managerCompanyB = users.find((user) => user.email === 'manager.companyB@example.com');

    if (userCompanyA && managerCompanyA && managerCompanyB) {
      // Assign roles to users
      userCompanyA.roles.push(userRoleCompanyA._id);
      managerCompanyA.roles.push(managerRoleCompanyA._id);
      managerCompanyB.roles.push(managerRoleCompanyB._id);

      // Attach policies to roles
      managerRoleCompanyA.policies.push(specificBookingPolicy._id); // Manager has access to the booking policy
      await managerRoleCompanyA.save();

      userRoleCompanyA.policies.push(specificBookingPolicy._id); // User has the policy as well
      await userRoleCompanyA.save();

      managerRoleCompanyB.policies.push(policy1._id); // Manager has access to the booking policy
      await managerRoleCompanyB.save();
      managerRoleCompanyB.policies.push(managerPolicy._id); // Manager has access to the booking policy
      await managerRoleCompanyB.save();

      await userCompanyA.save();
      await managerCompanyA.save();
      await managerCompanyB.save();

      console.log('Roles and policies assigned to users');
    }

    console.log('Data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
