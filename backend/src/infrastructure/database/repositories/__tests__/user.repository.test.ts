import { UserRepository } from '../user.repository';
import { PrismaService } from '../../prisma.service';

// Mock the dependencies
jest.mock('../../prisma.service');
jest.mock('../../prisma.service', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    company: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockPrismaClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPrismaClient = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      company: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    (PrismaService.getInstance as jest.Mock).mockReturnValue({
      getClient: () => mockPrismaClient,
    });

    userRepository = new UserRepository();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 'USER_123',
        email: 'test@example.com',
        user_name: 'Test User',
      };

      mockPrismaClient.user.findFirst.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: undefined,
        orderBy: undefined,
        select: undefined,
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaClient.user.findFirst.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByIdWithCompany', () => {
    it('should find user with company by id', async () => {
      const mockUserWithCompany = {
        id: 'USER_123',
        email: 'test@example.com',
        company: {
          id: 'COMPANY_123',
          company_name: 'Test Company',
        },
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUserWithCompany);

      const result = await userRepository.findByIdWithCompany('USER_123');

      expect(result).toEqual(mockUserWithCompany);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'USER_123' },
        include: { company: true },
      });
    });
  });

  describe('createWithCompany', () => {
    it('should create user with company', async () => {
      const userData = {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        user_name: 'Test User',
        role_id: 2,
        status_id: 3,
      };

      const companyData = {
        company_name: 'Test Company',
        company_description: 'Test Description',
        status_id: 2,
      };

      const mockTransaction = async (fn: any) => {
        const tx = {
          company: { create: jest.fn() },
          user: { create: jest.fn() },
        };

        const mockCompany = {
          id: 'COMPANY_123',
          ...companyData,
        };

        const mockUser = {
          id: 'USER_123',
          ...userData,
          company_id: 'COMPANY_123',
        };

        tx.company.create.mockResolvedValue(mockCompany);
        tx.user.create.mockResolvedValue(mockUser);

        return fn(tx);
      };

      mockPrismaClient.$transaction.mockImplementation(mockTransaction);

      const result = await userRepository.createWithCompany(userData, companyData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('company');
      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
    });

    it('should create user without company', async () => {
      const userData = {
        email: 'test@example.com',
        password_hash: 'hashed_password',
        user_name: 'Test User',
        role_id: 3,
        status_id: 3,
      };

      const mockTransaction = async (fn: any) => {
        const tx = {
          user: { create: jest.fn() },
        };

        const mockUser = {
          id: 'USER_123',
          ...userData,
        };

        tx.user.create.mockResolvedValue(mockUser);

        return fn(tx);
      };

      mockPrismaClient.$transaction.mockImplementation(mockTransaction);

      const result = await userRepository.createWithCompany(userData);

      expect(result.user).toBeDefined();
      expect(result.company).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('should update user status', async () => {
      const mockUpdatedUser = {
        id: 'USER_123',
        status_id: 1,
      };

      mockPrismaClient.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await userRepository.updateStatus('USER_123', 1);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'USER_123' },
        data: { 
          status_id: 1,
          updated_at: expect.any(Date),
        },
        include: undefined,
        select: undefined,
      });
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const mockUpdatedUser = {
        id: 'USER_123',
        password_hash: 'new_hashed_password',
      };

      mockPrismaClient.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await userRepository.updatePassword('USER_123', 'new_hashed_password');

      expect(result).toEqual(mockUpdatedUser);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'USER_123' },
        data: { 
          password_hash: 'new_hashed_password',
          updated_at: expect.any(Date),
        },
        include: undefined,
        select: undefined,
      });
    });
  });

  describe('findPendingMembers', () => {
    it('should find pending members by company id', async () => {
      const mockPendingMembers = [
        { id: 'USER_1', status_id: 3, company_id: 'COMPANY_123' },
        { id: 'USER_2', status_id: 3, company_id: 'COMPANY_123' },
      ];

      mockPrismaClient.user.findMany.mockResolvedValue(mockPendingMembers);

      const result = await userRepository.findPendingMembers('COMPANY_123');

      expect(result).toEqual(mockPendingMembers);
      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: {
          company_id: 'COMPANY_123',
          status_id: 3,
        },
        orderBy: { created_at: 'desc' },
        include: undefined,
        skip: undefined,
        take: undefined,
        select: undefined,
      });
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login time', async () => {
      const mockUpdatedUser = {
        id: 'USER_123',
        last_login_at: new Date(),
      };

      mockPrismaClient.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await userRepository.updateLastLogin('USER_123');

      expect(result).toEqual(mockUpdatedUser);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 'USER_123' },
        data: { 
          last_login_at: expect.any(Date),
          updated_at: expect.any(Date),
        },
        include: undefined,
        select: undefined,
      });
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 'USER_1', email: 'user1@example.com' },
        { id: 'USER_2', email: 'user2@example.com' },
      ];

      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaClient.user.count.mockResolvedValue(10);

      const result = await userRepository.findWithPagination(1, 2, { status_id: 1 });

      expect(result).toEqual({
        data: mockUsers,
        total: 10,
        page: 1,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      });

      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith({
        where: { status_id: 1 },
        include: { company: true },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 2,
        select: undefined,
      });
    });
  });
});