import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

interface DecodedUser {
  id: number;
  name?: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
}

// Extend Express Request to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: DecodedUser;
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as DecodedUser;

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
