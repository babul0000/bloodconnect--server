import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { usersCollection, db } from '../config/db';

export interface AuthenticatedRequest extends Request {
  currentUser?: any;
}

export const authorizeAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token is missing' });
    }
    let decoded: any = null;

    try {
      decoded = jwt.verify(token, process.env.BETTER_AUTH_SECRET || 'secret');
    } catch (err) {
      // Session lookup fallback in MongoDB
      const sessionDoc = await db.collection('session').findOne({ token });
      if (sessionDoc) {
        const userDoc = await usersCollection.findOne({ _id: new ObjectId(sessionDoc.userId) });
        if (userDoc && userDoc.role === 'admin') {
          req.currentUser = userDoc;
          return next();
        }
      }

      // Unverified decode fallback to check DB record directly
      const unverifiedDecoded = jwt.decode(token) as any;
      if (unverifiedDecoded && (unverifiedDecoded.userId || unverifiedDecoded.email)) {
        const query = unverifiedDecoded.userId 
          ? { _id: new ObjectId(unverifiedDecoded.userId) }
          : { email: unverifiedDecoded.email };
        const userDoc = await usersCollection.findOne(query);
        if (userDoc && userDoc.role === 'admin') {
          req.currentUser = userDoc;
          return next();
        }
      }

      return res.status(401).json({ error: 'Unauthorized: Invalid token signature' });
    }

    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    const userId = decoded.userId || decoded.sub || decoded.id;
    const userEmail = decoded.email;

    let userDoc = null;
    if (ObjectId.isValid(userId)) {
      userDoc = await usersCollection.findOne({ _id: new ObjectId(userId) });
    } else if (userEmail) {
      userDoc = await usersCollection.findOne({ email: userEmail });
    }

    if (!userDoc) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    if (userDoc.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    req.currentUser = userDoc;
    next();
  } catch (error) {
    console.error('Middleware authorization failure:', error);
    res.status(500).json({ error: 'Internal server authorization error' });
  }
};
