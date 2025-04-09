import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prisma } from './index';
import { createLoaders } from './dataloaders';

type TokenPayload = {
  userId: string;
};

export type Context = {
  prisma: PrismaClient;
  userId: string | null;
  loaders: ReturnType<typeof createLoaders>;
};

export const createContext = async ({ req }: { req: any }): Promise<Context> => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  let userId: string | null = null;
  
  if (token) {
    try {
      // Verify the token and extract the userId
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;
      userId = decoded.userId;
    } catch (error) {
      // Token is invalid or expired
      console.error('Invalid token:', error);
    }
  }
  
  // Create and return the context object
  return {
    prisma,
    userId,
    loaders: createLoaders(prisma),
  };
};
