import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';

export interface RequestWithUser extends Request {
  user?: {
    _id: string;
    username: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({ message: 'User not found.' });
      return;
    }

    req.user = {
      _id: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('JWT auth error:', error);
    res.status(400).json({ message: 'Invalid token.' });
  }
};
