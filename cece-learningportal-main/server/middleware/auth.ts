import { Request, Response, NextFunction } from 'express';
import { queryOne } from '../database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify token and get user
    const session = await queryOne(`
      SELECT s.user_id, s.expires_at, u.email, p.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      JOIN profiles p ON u.id = p.id
      WHERE s.access_token = $1
    `, [token]);

    if (!session) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      return res.status(403).json({ error: 'Token expired' });
    }

    // Add user info to request
    req.user = {
      id: session.user_id,
      email: session.email,
      role: session.role
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role && req.user.role !== 'Admin') {
      return res.status(403).json({ error: `${role} role required` });
    }

    next();
  };
}