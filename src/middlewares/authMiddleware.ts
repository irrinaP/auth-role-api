import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare module 'express' {
  interface Request {
    userId?: string;
  }
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as {
      userId: string;
    };

    req.userId = decoded.userId;

    next();
  } catch {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export { authenticateJWT as authMiddleware };
