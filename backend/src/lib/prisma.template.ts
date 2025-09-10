/**
 * Prisma Client Singleton
 * This file ensures we use a single PrismaClient instance throughout the application
 */

import { PrismaClient } from '@prisma/client';

// Extend global object to include prisma client
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Configuration based on environment
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] as const
    : ['error'] as const,
  errorFormat: process.env.NODE_ENV === 'development' 
    ? 'pretty' as const 
    : 'minimal' as const,
};

// Create or reuse existing prisma client
export const prisma = global.prisma || new PrismaClient(prismaClientOptions);

// In development, save the client to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Middleware example: Log query execution time in development
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });
}

// Export useful Prisma types
export type { User, Prisma } from '@prisma/client';

/**
 * Helper function to handle Prisma errors
 */
export function isPrismaError(error: unknown): error is Error {
  return error instanceof Error && error.name.startsWith('Prisma');
}

/**
 * Helper to handle unique constraint violations
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return isPrismaError(error) && error.message.includes('Unique constraint');
}

/**
 * Helper to handle foreign key constraint violations
 */
export function isForeignKeyConstraintError(error: unknown): boolean {
  return isPrismaError(error) && error.message.includes('Foreign key constraint');
}

/**
 * Transaction helper with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on validation errors
      if (isPrismaError(error) && error.message.includes('validation')) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}