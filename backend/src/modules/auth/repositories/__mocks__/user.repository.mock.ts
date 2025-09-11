import { jest } from '@jest/globals';
import { User, Company } from '@prisma/client';
import { IUserRepository } from '@shared/interfaces/repository.interfaces';

/**
 * UserRepository Mock Implementation
 * 모든 UserRepository 메서드를 jest.Mock으로 구현
 */
export class MockUserRepository implements IUserRepository {
  // Base repository methods
  public findById = jest.fn() as any;
  public findOne = jest.fn() as any;
  public findAll = jest.fn() as any;
  public create = jest.fn() as any;
  public update = jest.fn() as any;
  public delete = jest.fn() as any;
  public count = jest.fn() as any;
  public exists = jest.fn() as any;
  public paginate = jest.fn() as any;
  public transaction = jest.fn() as any;

  // IUserRepository specific methods
  public findByEmail = jest.fn() as any;
  public findByIdWithCompany = jest.fn() as any;
  public createWithCompany = jest.fn() as any;
  public updateStatus = jest.fn() as any;
  public updatePassword = jest.fn() as any;
  public findPendingMembers = jest.fn() as any;
  public findByCompanyId = jest.fn() as any;
  public updateLastLogin = jest.fn() as any;
  public findActiveUsersByRole = jest.fn() as any;
  public findWithPagination = jest.fn() as any;

  constructor() {
    this.setupDefaultMocks();
  }

  /**
   * 기본 Mock 동작 설정
   */
  private setupDefaultMocks(): void {
    // Base methods
    this.findById.mockResolvedValue(null);
    this.findOne.mockResolvedValue(null);
    this.findAll.mockResolvedValue([]);
    this.create.mockResolvedValue(this.createMockUser());
    this.update.mockResolvedValue(this.createMockUser());
    this.delete.mockResolvedValue(this.createMockUser());
    this.count.mockResolvedValue(0);
    this.exists.mockResolvedValue(false);
    this.paginate.mockResolvedValue({
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
    this.transaction.mockImplementation(async (fn: (tx: any) => Promise<any>) => {
      return fn({});
    });

    // Specific methods
    this.findByEmail.mockResolvedValue(null);
    this.findByIdWithCompany.mockResolvedValue(null);
    this.createWithCompany.mockResolvedValue({
      user: this.createMockUser(),
      company: this.createMockCompany(),
    });
    this.updateStatus.mockResolvedValue(this.createMockUser());
    this.updatePassword.mockResolvedValue(this.createMockUser());
    this.findPendingMembers.mockResolvedValue([]);
    this.findByCompanyId.mockResolvedValue([]);
    this.updateLastLogin.mockResolvedValue(this.createMockUser());
    this.findActiveUsersByRole.mockResolvedValue([]);
    this.findWithPagination.mockResolvedValue({
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
  }

  /**
   * Mock User 객체 생성
   */
  private createMockUser(overrides?: Partial<User>): User {
    return {
      id: 'USER_test123',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      user_name: 'Test User',
      phone_number: '010-1234-5678',
      role_id: 2, // COMPANY_MANAGER
      status_id: 1, // ACTIVE
      company_id: 'COMPANY_test123',
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
      ...overrides,
    };
  }

  /**
   * Mock Company 객체 생성
   */
  private createMockCompany(overrides?: Partial<Company>): Company {
    return {
      id: 'COMPANY_test123',
      company_name: 'Test Company',
      company_description: 'Test company description',
      status_id: 1, // ACTIVE
      invitation_code: 'INV123',
      manager_id: 'USER_manager123',
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      ...overrides,
    };
  }

  /**
   * 모든 mock 초기화
   */
  public resetMocks(): void {
    Object.getOwnPropertyNames(this).forEach((prop) => {
      const method = (this as any)[prop];
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
    this.setupDefaultMocks();
  }

  /**
   * 특정 시나리오를 위한 헬퍼 메서드들
   */

  public mockUserExists(user?: Partial<User>): User {
    const mockUser = this.createMockUser(user);
    this.findById.mockResolvedValue(mockUser);
    this.findByEmail.mockResolvedValue(mockUser);
    return mockUser;
  }

  public mockUserNotFound(): void {
    this.findById.mockResolvedValue(null);
    this.findByEmail.mockResolvedValue(null);
    this.findByIdWithCompany.mockResolvedValue(null);
  }

  public mockUserWithCompany(user?: Partial<User>, company?: Partial<Company>): User & { company: Company } {
    const mockUser = this.createMockUser(user);
    const mockCompany = this.createMockCompany(company);
    const result = { ...mockUser, company: mockCompany };
    
    this.findByIdWithCompany.mockResolvedValue(result);
    return result;
  }

  public mockCreateUserWithCompany(user?: Partial<User>, company?: Partial<Company>): {
    user: User;
    company: Company;
  } {
    const mockUser = this.createMockUser(user);
    const mockCompany = this.createMockCompany(company);
    const result = { user: mockUser, company: mockCompany };
    
    this.createWithCompany.mockResolvedValue(result);
    return result;
  }

  public mockPendingMembers(members?: Partial<User>[]): User[] {
    const mockMembers = members?.map(member => this.createMockUser({ 
      status_id: 3, // PENDING
      ...member 
    })) || [];
    
    this.findPendingMembers.mockResolvedValue(mockMembers);
    return mockMembers;
  }

  public mockCompanyUsers(users?: Partial<User>[]): User[] {
    const mockUsers = users?.map(user => this.createMockUser(user)) || [];
    
    this.findByCompanyId.mockResolvedValue(mockUsers);
    this.findActiveUsersByRole.mockResolvedValue(mockUsers);
    return mockUsers;
  }

  public mockPaginatedUsers(
    users?: Partial<User>[],
    total: number = 0,
    page: number = 1,
    limit: number = 10
  ) {
    const mockUsers = users?.map(user => this.createMockUser(user)) || [];
    const totalPages = Math.ceil(total / limit);
    
    const result = {
      data: mockUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
    
    this.findWithPagination.mockResolvedValue(result);
    this.paginate.mockResolvedValue(result);
    return result;
  }

  public mockRepositoryError(error: Error): void {
    // 모든 메서드가 에러를 던지도록 설정
    Object.getOwnPropertyNames(this).forEach((prop) => {
      const method = (this as any)[prop];
      if (jest.isMockFunction(method)) {
        (method as any).mockRejectedValue(error);
      }
    });
  }

  public mockTransactionFailure(error: Error): void {
    this.transaction.mockRejectedValue(error);
    this.createWithCompany.mockRejectedValue(error);
  }

  /**
   * 특정 메서드만 성공하도록 설정하는 헬퍼
   */
  public mockSuccessfulUpdate(user?: Partial<User>): User {
    const mockUser = this.createMockUser(user);
    this.update.mockResolvedValue(mockUser);
    this.updateStatus.mockResolvedValue(mockUser);
    this.updatePassword.mockResolvedValue(mockUser);
    this.updateLastLogin.mockResolvedValue(mockUser);
    return mockUser;
  }
}

/**
 * Factory functions
 */
export const createMockUserRepository = (): MockUserRepository => {
  return new MockUserRepository();
};

/**
 * Singleton instance for consistent mocking
 */
export const mockUserRepository = createMockUserRepository();

/**
 * Jest mock implementation for DI container
 */
export const MockUserRepositoryImplementation = (): IUserRepository => {
  return mockUserRepository;
};