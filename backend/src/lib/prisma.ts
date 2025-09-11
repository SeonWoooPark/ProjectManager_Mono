import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Prisma 연결 관리
export async function connectPrisma() {
  try {
    await prisma.$connect();
  } catch (error) {
    throw error;
  }
}

export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    throw error;
  }
}

// 에러 처리 헬퍼
export function isPrismaError(error: unknown): error is Error {
  return error instanceof Error && error.message.includes('prisma');
}

export function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as any;
  return e.code === 'P2002';
}

export function isRecordNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as any;
  return e.code === 'P2025';
}

// 트랜잭션 헬퍼
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    return await fn(tx);
  });
}

// 재시도 로직을 포함한 헬퍼
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // 재시도 불가능한 에러는 즉시 throw
      if (isUniqueConstraintError(error)) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}