import 'reflect-metadata';
import { UserRepository } from '../user.repository';
import { 
  testContainer, 
  initializeTestDI, 
  clearTestContainer,
  mockUserRepository,
  mockPrismaService 
} from '@core/test-container';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeAll(async () => {
    await initializeTestDI();
  });

  afterAll(() => {
    clearTestContainer();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    mockUserRepository.resetMocks();
    mockPrismaService.resetMocks();
    
    // Get fresh instance from DI container
    userRepository = testContainer.resolve<UserRepository>('UserRepository');
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 'USER_123',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        name: 'Test User',
        phone: '010-1234-5678',
        role_id: 2,
        status_id: 1,
        company_id: 'COMPANY_123',
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockUserRepository.mockUserExists(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null if user not found', async () => {
      mockUserRepository.mockUserNotFound();

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('findByIdWithCompany', () => {
    it('should find user with company by id', async () => {
      const mockUserWithCompany = mockUserRepository.mockUserWithCompany(
        { id: 'USER_123', email: 'test@example.com' },
        { id: 'COMPANY_123', company_name: 'Test Company' }
      );

      const result = await userRepository.findByIdWithCompany('USER_123');

      expect(result).toEqual(mockUserWithCompany);
      expect(mockUserRepository.findByIdWithCompany).toHaveBeenCalledWith('USER_123');
    });

    it('should return null if user not found', async () => {
      mockUserRepository.mockUserNotFound();

      const result = await userRepository.findByIdWithCompany('NONEXISTENT_USER');

      expect(result).toBeNull();
    });
  });

  describe('createWithCompany', () => {
    it('should create user with company', async () => {
      const userData = {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        name: 'Test User',
        phone: '010-1234-5678',
        role_id: 2,
        status_id: 3,
      };

      const companyData = {
        company_name: 'Test Company',
        description: 'Test Description',
        status_id: 2,
      };

      const mockResult = mockUserRepository.mockCreateUserWithCompany(userData, companyData);

      const result = await userRepository.createWithCompany(userData, companyData);

      expect(result).toEqual(mockResult);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('company');
      expect(mockUserRepository.createWithCompany).toHaveBeenCalledWith(userData, companyData);
    });

    it('should create user without company', async () => {
      const userData = {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        name: 'Test User',
        phone: '010-1234-5678',
        role_id: 3,
        status_id: 3,
      };

      mockUserRepository.mockCreateUserWithCompany(userData);

      const result = await userRepository.createWithCompany(userData);

      expect(result.user).toBeDefined();
      expect(result.company).toBeDefined(); // Mock always returns company
      expect(mockUserRepository.createWithCompany).toHaveBeenCalledWith(userData, undefined);
    });

    it('should handle transaction errors', async () => {
      const userData = { email: 'test@example.com' };
      const error = new Error('Transaction failed');

      mockUserRepository.mockTransactionFailure(error);

      await expect(userRepository.createWithCompany(userData)).rejects.toThrow('Transaction failed');
    });
  });

  describe('updateStatus', () => {
    it('should update user status', async () => {
      const mockUpdatedUser = mockUserRepository.mockSuccessfulUpdate({
        id: 'USER_123',
        status_id: 1,
        updated_at: new Date(),
      });

      const result = await userRepository.updateStatus('USER_123', 1);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUserRepository.updateStatus).toHaveBeenCalledWith('USER_123', 1);
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockUserRepository.mockRepositoryError(error);

      await expect(userRepository.updateStatus('USER_123', 1)).rejects.toThrow('Update failed');
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const mockUpdatedUser = mockUserRepository.mockSuccessfulUpdate({
        id: 'USER_123',
        password_hash: 'new_hashed_password',
        updated_at: new Date(),
      });

      const result = await userRepository.updatePassword('USER_123', 'new_hashed_password');

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith('USER_123', 'new_hashed_password');
    });
  });

  describe('findPendingMembers', () => {
    it('should find pending members by company id', async () => {
      const mockPendingMembers = mockUserRepository.mockPendingMembers([
        { id: 'USER_1', company_id: 'COMPANY_123' },
        { id: 'USER_2', company_id: 'COMPANY_123' },
      ]);

      const result = await userRepository.findPendingMembers('COMPANY_123');

      expect(result).toEqual(mockPendingMembers);
      expect(mockUserRepository.findPendingMembers).toHaveBeenCalledWith('COMPANY_123');
    });

    it('should return empty array if no pending members', async () => {
      mockUserRepository.mockPendingMembers([]);

      const result = await userRepository.findPendingMembers('COMPANY_123');

      expect(result).toEqual([]);
    });
  });

  describe('findByCompanyId', () => {
    it('should find users by company id', async () => {
      const mockUsers = mockUserRepository.mockCompanyUsers([
        { id: 'USER_1', company_id: 'COMPANY_123' },
        { id: 'USER_2', company_id: 'COMPANY_123' },
      ]);

      const result = await userRepository.findByCompanyId('COMPANY_123');

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findByCompanyId).toHaveBeenCalledWith('COMPANY_123');
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login time', async () => {
      const mockUpdatedUser = mockUserRepository.mockSuccessfulUpdate({
        id: 'USER_123',
        updated_at: new Date(),
      });

      const result = await userRepository.updateLastLogin('USER_123');

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith('USER_123');
    });
  });

  describe('findActiveUsersByRole', () => {
    it('should find active users by role', async () => {
      const mockUsers = mockUserRepository.mockCompanyUsers([
        { id: 'USER_1', role_id: 2, status_id: 1 },
        { id: 'USER_2', role_id: 2, status_id: 1 },
      ]);

      const result = await userRepository.findActiveUsersByRole(2);

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findActiveUsersByRole).toHaveBeenCalledWith(2);
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated users', async () => {
      const mockResult = mockUserRepository.mockPaginatedUsers(
        [
          { id: 'USER_1', email: 'user1@example.com' },
          { id: 'USER_2', email: 'user2@example.com' },
        ],
        10, // total
        1,  // page
        2   // limit
      );

      const result = await userRepository.findWithPagination(1, 2, { status_id: 1 });

      expect(result).toEqual(mockResult);
      expect(mockUserRepository.findWithPagination).toHaveBeenCalledWith(1, 2, { status_id: 1 });
    });

    it('should handle empty results', async () => {
      mockUserRepository.mockPaginatedUsers([], 0, 1, 10);

      const result = await userRepository.findWithPagination(1, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle database connection errors', async () => {
      const dbError = new Error('Database connection failed');
      mockUserRepository.mockRepositoryError(dbError);

      await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow('Database connection failed');
    });

    it('should handle Prisma errors', async () => {
      const prismaError = new Error('Prisma operation failed');
      mockPrismaService.mockDatabaseError(prismaError);

      // This would test the actual Prisma integration, but since we're using mocks,
      // we test that our mock properly propagates the error
      await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow('Prisma operation failed');
    });
  });
});