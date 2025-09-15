import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Note: PrismaService is a Singleton and doesn't use @injectable() 
// It's manually registered in the DI container
export class PrismaService {
  private static instance: PrismaService;
  private client: PrismaClient;

  private constructor() {
    this.client = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = this.client;
    }
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  public getClient(): PrismaClient {
    return this.client;
  }

  public async connect(): Promise<void> {
    await this.client.$connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }

  public async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return this.client.$transaction(fn);
  }

  public async executeRaw<T = any>(query: string, ...params: any[]): Promise<T> {
    return this.client.$queryRawUnsafe(query, ...params) as Promise<T>;
  }

  // 에러 처리 헬퍼
  public isPrismaError(error: unknown): error is Error {
    return error instanceof Error && error.message.includes('prisma');
  }

  public isUniqueConstraintError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const e = error as any;
    return e.code === 'P2002';
  }

  public isRecordNotFoundError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const e = error as any;
    return e.code === 'P2025';
  }

  // 재시도 로직을 포함한 헬퍼
  public async withRetry<T>(
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
        if (this.isUniqueConstraintError(error)) {
          throw error;
        }
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  }
}

// 편의 함수 export
export const prismaService = PrismaService.getInstance();
export const prisma = prismaService.getClient();