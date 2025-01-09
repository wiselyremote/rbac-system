import { userModel } from '@/models/user.model';
import bcrypt from 'bcrypt';
import express, { Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// JWT Secret Key (Use a secure key in production)
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';
const JWT_EXPIRATION = '1h'; // Token expiration time (adjust as needed)

// Login Route
const loginHandler: RequestHandler = async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      response.status(400).json({ message: 'Email and password are required' }); // Bad Request
      return;
    }

    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      response.status(401).json({ message: 'Invalid email or password' }); // Unauthorized
      return;
    }

    // Verify password (use bcrypt for hashed passwords)
    const isPasswordValid = await bcrypt.compare(password, user.password); // Assuming password is hashed
    if (!isPasswordValid) {
      response.status(401).json({ message: 'Invalid email or password' }); // Unauthorized
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        company: user.company,
        roles: user.roles,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION },
    );

    // Return the token in response
    response.set('Authorization', `Bearer ${token}`);
    response.status(200).json({
      message: 'Login successful',
      token, // Also include the token in the response body for debugging
    });
  } catch (error) {
    console.error('Error during login:', error);
    response.status(500).json({ message: 'Internal server error' }); // Internal Server Error
  }
};

router.post('/login', loginHandler);

export const loginRouter = router;
