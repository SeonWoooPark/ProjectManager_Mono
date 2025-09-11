/**
 * PrismaService Mock
 * Prisma 클라이언트와 서비스의 모든 메서드를 Mock으로 구현
 */
export class MockPrismaService {
  // Mock client with all necessary models
  public mockClient = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    company: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    tokenBlacklist: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    $queryRawUnsafe: jest.fn(),
  };

  // PrismaService methods
  public getClient = jest.fn();
  public connect = jest.fn();
  public disconnect = jest.fn();
  public transaction = jest.fn();
  public executeRaw = jest.fn();

  constructor() {
    // Setup default return values
    this.getClient.mockReturnValue(this.mockClient);
    this.connect.mockResolvedValue(undefined);
    this.disconnect.mockResolvedValue(undefined);
    
    // Configure transaction mock to execute the callback with mockClient
    this.transaction.mockImplementation(async (fn: any) => {
      return fn(this.mockClient);
    });

    this.mockClient.$transaction.mockImplementation(async (fn: any) => {
      return fn(this.mockClient);
    });
  }

  /**
   * Factory method to create a fresh mock instance
   */
  static create(): MockPrismaService {
    return new MockPrismaService();
  }

  /**
   * Reset all mocks to their initial state
   */
  public resetMocks(): void {
    Object.values(this.mockClient).forEach((model: any) => {
      if (typeof model === 'object' && model !== null) {
        Object.values(model).forEach((method: any) => {
          if (typeof method?.mockReset === 'function') {
            method.mockReset();
          }
        });
      }
    });

    // Reset service-level mocks
    this.getClient.mockReset();
    this.getClient.mockReturnValue(this.mockClient);
    this.connect.mockReset();
    this.connect.mockResolvedValue(undefined);
    this.disconnect.mockReset();
    this.disconnect.mockResolvedValue(undefined);
    this.transaction.mockReset();
    this.transaction.mockImplementation(async (fn: any) => {
      return fn(this.mockClient);
    });
    this.executeRaw.mockReset();

    // Reset client-level mocks
    this.mockClient.$connect.mockReset();
    this.mockClient.$connect.mockResolvedValue(undefined);
    this.mockClient.$disconnect.mockReset();
    this.mockClient.$disconnect.mockResolvedValue(undefined);
    this.mockClient.$transaction.mockReset();
    this.mockClient.$transaction.mockImplementation(async (fn: any) => {
      return fn(this.mockClient);
    });
    this.mockClient.$queryRawUnsafe.mockReset();
  }

  /**
   * Configure successful responses for common operations
   */
  public setupSuccessfulMocks(): void {
    // User model defaults
    this.mockClient.user.findUnique.mockResolvedValue(null);
    this.mockClient.user.findMany.mockResolvedValue([]);
    this.mockClient.user.create.mockResolvedValue({
      id: 'USER_test123',
      email: 'test@example.com',
      name: 'Test User',
      created_at: new Date(),
    });
    this.mockClient.user.update.mockResolvedValue({
      id: 'USER_test123',
      email: 'test@example.com',
      name: 'Test User',
      updated_at: new Date(),
    });
    this.mockClient.user.count.mockResolvedValue(0);

    // Company model defaults
    this.mockClient.company.findUnique.mockResolvedValue(null);
    this.mockClient.company.findMany.mockResolvedValue([]);
    this.mockClient.company.create.mockResolvedValue({
      id: 'COMPANY_test123',
      company_name: 'Test Company',
      created_at: new Date(),
    });
    this.mockClient.company.update.mockResolvedValue({
      id: 'COMPANY_test123',
      company_name: 'Test Company',
      updated_at: new Date(),
    });

    // Token model defaults
    this.mockClient.refreshToken.findUnique.mockResolvedValue(null);
    this.mockClient.refreshToken.create.mockResolvedValue({
      id: 'token123',
      user_id: 'USER_test123',
      token: 'refresh_token',
      expires_at: new Date(),
    });

    this.mockClient.passwordResetToken.findUnique.mockResolvedValue(null);
    this.mockClient.passwordResetToken.create.mockResolvedValue({
      id: 'reset123',
      user_id: 'USER_test123',
      token: 'reset_token',
      expires_at: new Date(),
    });

    this.mockClient.tokenBlacklist.findUnique.mockResolvedValue(null);
    this.mockClient.tokenBlacklist.create.mockResolvedValue({
      token: 'blacklisted_token',
      expires_at: new Date(),
    });
  }

  /**
   * Helper methods for specific test scenarios
   */
  public mockUserExists(user: any): void {
    this.mockClient.user.findUnique.mockResolvedValue(user);
  }

  public mockUserNotFound(): void {
    this.mockClient.user.findUnique.mockResolvedValue(null);
  }

  public mockCompanyExists(company: any): void {
    this.mockClient.company.findUnique.mockResolvedValue(company);
  }

  public mockCompanyNotFound(): void {
    this.mockClient.company.findUnique.mockResolvedValue(null);
  }

  public mockTokenExists(token: any): void {
    this.mockClient.refreshToken.findUnique.mockResolvedValue(token);
  }

  public mockTokenNotFound(): void {
    this.mockClient.refreshToken.findUnique.mockResolvedValue(null);
  }

  public mockDatabaseError(error: Error): void {
    // Mock all methods to throw the error
    Object.values(this.mockClient).forEach((model: any) => {
      if (typeof model === 'object' && model !== null) {
        Object.values(model).forEach((method: any) => {
          if (typeof method?.mockRejectedValue === 'function') {
            method.mockRejectedValue(error);
          }
        });
      }
    });
  }
}

/**
 * Export singleton instance for consistent mocking
 */
export const mockPrismaService = MockPrismaService.create();

/**
 * Factory function for creating new instances
 */
export const createMockPrismaService = (): MockPrismaService => {
  return MockPrismaService.create();
};

/**
 * Jest mock implementation for DI container
 */
export const MockPrismaServiceImplementation = {
  getInstance: jest.fn().mockReturnValue(mockPrismaService),
  getClient: jest.fn().mockReturnValue(mockPrismaService.mockClient),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  transaction: jest.fn().mockImplementation(async (fn: any) => {
    return fn(mockPrismaService.mockClient);
  }),
  executeRaw: jest.fn(),
};