import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../services/dbStore.js';
import { generateTokens, REFRESH_SECRET } from '../middleware/auth.middleware.js';
import type { JWTPayload } from '../../shared/types/index.js';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      const existing = dbStore.findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists' });
      }

      const newUser = dbStore.createUser(name, email, password);
      const { token, refreshToken } = generateTokens(newUser._id, newUser.email);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        user: newUser,
        token,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = dbStore.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValid = dbStore.verifyPassword(user._id, password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const { token, refreshToken } = generateTokens(user._id, user.email);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        user,
        token,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  },

  async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = dbStore.findUserById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const workspaces = dbStore.getUserWorkspaces(user._id);

      return res.json({
        user,
        workspaces,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
      }

      const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as JWTPayload;
      const user = dbStore.findUserById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { token: newAccessToken } = generateTokens(user._id, user.email);
      return res.json({ token: newAccessToken });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  },
};
