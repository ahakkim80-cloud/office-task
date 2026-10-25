import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../services/dbStore.js';
import type { JWTPayload } from '../../shared/types/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'taskflow-super-secret-jwt-key-2026';
export const REFRESH_SECRET = process.env.REFRESH_SECRET || 'taskflow-super-secret-refresh-key-2026';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        name: string;
        email: string;
        role?: string;
      };
    }
  }
}

export function generateTokens(userId: string, email: string) {
  const token = jwt.sign({ userId, email } as JWTPayload, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId, email } as JWTPayload, REFRESH_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const user = dbStore.findUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'User session expired or user not found.' });
      return;
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
