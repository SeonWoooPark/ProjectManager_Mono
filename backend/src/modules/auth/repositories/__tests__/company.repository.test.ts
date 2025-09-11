import { CompanyRepository } from '../company.repository';
import { PrismaService } from '../../prisma.service';

// Mock the dependencies
jest.mock('../../prisma.service');
jest.mock('@infrastructure/database/prisma.service', () => ({
  prisma: {
    company: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    project: {
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('CompanyRepository', () => {
  let companyRepository: CompanyRepository;
  let mockPrismaClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPrismaClient = {
      company: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      user: {
        count: jest.fn(),
      },
      project: {
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    (PrismaService.getInstance as jest.Mock).mockReturnValue({
      getClient: () => mockPrismaClient,
    });

    companyRepository = new CompanyRepository();
  });

  describe('findByName', () => {
    it('should find company by name', async () => {
      const mockCompany = {
        id: 'COMPANY_123',
        company_name: 'Test Company',
        status_id: 1,
      };

      mockPrismaClient.company.findFirst.mockResolvedValue(mockCompany);

      const result = await companyRepository.findByName('Test Company');

      expect(result).toEqual(mockCompany);
      expect(mockPrismaClient.company.findFirst).toHaveBeenCalledWith({
        where: { company_name: 'Test Company' },
        include: undefined,
        orderBy: undefined,
        select: undefined,
      });
    });

    it('should return null if company not found', async () => {
      mockPrismaClient.company.findFirst.mockResolvedValue(null);

      const result = await companyRepository.findByName('Nonexistent Company');

      expect(result).toBeNull();
    });
  });

  describe('findPendingCompanies', () => {
    it('should find all pending companies', async () => {
      const mockPendingCompanies = [
        {
          id: 'COMPANY_1',
          company_name: 'Company 1',
          status_id: 2,
          manager: { id: 'USER_1', user_name: 'Manager 1' },
          status: { id: 2, status_name: 'PENDING' },
        },
        {
          id: 'COMPANY_2',
          company_name: 'Company 2',
          status_id: 2,
          manager: { id: 'USER_2', user_name: 'Manager 2' },
          status: { id: 2, status_name: 'PENDING' },
        },
      ];

      mockPrismaClient.company.findMany.mockResolvedValue(mockPendingCompanies);

      const result = await companyRepository.findPendingCompanies();

      expect(result).toEqual(mockPendingCompanies);
      expect(mockPrismaClient.company.findMany).toHaveBeenCalledWith({
        where: { status_id: 2 },
        include: {
          manager: true,
          status: true,
        },
        orderBy: { created_at: 'desc' },
        skip: undefined,
        take: undefined,
        select: undefined,
      });
    });
  });

  describe('updateApprovalStatus', () => {
    it('should update company approval status with invitation code', async () => {
      const mockUpdatedCompany = {
        id: 'COMPANY_123',
        status_id: 1,
        invitation_code: 'ABC123',
        manager: { id: 'USER_123' },
        status: { id: 1, status_name: 'ACTIVE' },
      };

      mockPrismaClient.company.update.mockResolvedValue(mockUpdatedCompany);

      const result = await companyRepository.updateApprovalStatus('COMPANY_123', 1, 'ABC123');

      expect(result).toEqual(mockUpdatedCompany);
      expect(mockPrismaClient.company.update).toHaveBeenCalledWith({
        where: { id: 'COMPANY_123' },
        data: {
          status_id: 1,
          invitation_code: 'ABC123',
        },
        include: {
          manager: true,
          status: true,
        },
        select: undefined,
      });
    });

    it('should update company approval status without invitation code', async () => {
      const mockUpdatedCompany = {
        id: 'COMPANY_123',
        status_id: 3,
      };

      mockPrismaClient.company.update.mockResolvedValue(mockUpdatedCompany);

      const result = await companyRepository.updateApprovalStatus('COMPANY_123', 3);

      expect(result).toEqual(mockUpdatedCompany);
      expect(mockPrismaClient.company.update).toHaveBeenCalledWith({
        where: { id: 'COMPANY_123' },
        data: { status_id: 3 },
        include: {
          manager: true,
          status: true,
        },
        select: undefined,
      });
    });
  });

  describe('generateInvitationCode', () => {
    it('should generate unique invitation code', async () => {
      // First call returns existing company, second call returns null
      mockPrismaClient.company.findFirst
        .mockResolvedValueOnce({ id: 'EXISTING', invitation_code: 'ABC123' })
        .mockResolvedValueOnce(null);

      const result = await companyRepository.generateInvitationCode();

      expect(result).toBeDefined();
      expect(result).toHaveLength(6);
      expect(mockPrismaClient.company.findFirst).toHaveBeenCalledTimes(2);
    });
  });

  describe('findByInvitationCode', () => {
    it('should find active company by invitation code', async () => {
      const mockCompany = {
        id: 'COMPANY_123',
        company_name: 'Test Company',
        invitation_code: 'ABC123',
        status_id: 1,
        manager: { id: 'USER_123' },
        status: { id: 1, status_name: 'ACTIVE' },
      };

      mockPrismaClient.company.findFirst.mockResolvedValue(mockCompany);

      const result = await companyRepository.findByInvitationCode('ABC123');

      expect(result).toEqual(mockCompany);
      expect(mockPrismaClient.company.findFirst).toHaveBeenCalledWith({
        where: {
          invitation_code: 'ABC123',
          status_id: 1,
        },
        include: {
          manager: true,
          status: true,
        },
        orderBy: undefined,
        select: undefined,
      });
    });
  });

  describe('findWithEmployees', () => {
    it('should find company with all related data', async () => {
      const mockCompanyWithEmployees = {
        id: 'COMPANY_123',
        company_name: 'Test Company',
        manager: { id: 'USER_123' },
        employees: [
          { id: 'USER_1', user_name: 'Employee 1' },
          { id: 'USER_2', user_name: 'Employee 2' },
        ],
        projects: [
          { id: 'PROJECT_1', project_name: 'Project 1' },
        ],
        status: { id: 1, status_name: 'ACTIVE' },
      };

      mockPrismaClient.company.findUnique.mockResolvedValue(mockCompanyWithEmployees);

      const result = await companyRepository.findWithEmployees('COMPANY_123');

      expect(result).toEqual(mockCompanyWithEmployees);
      expect(mockPrismaClient.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'COMPANY_123' },
        include: {
          manager: true,
          employees: {
            orderBy: { created_at: 'desc' },
          },
          projects: {
            orderBy: { created_at: 'desc' },
          },
          status: true,
        },
        select: undefined,
      });
    });
  });

  describe('updateManager', () => {
    it('should update company manager', async () => {
      const mockUpdatedCompany = {
        id: 'COMPANY_123',
        manager_id: 'USER_456',
      };

      mockPrismaClient.company.update.mockResolvedValue(mockUpdatedCompany);

      const result = await companyRepository.updateManager('COMPANY_123', 'USER_456');

      expect(result).toEqual(mockUpdatedCompany);
      expect(mockPrismaClient.company.update).toHaveBeenCalledWith({
        where: { id: 'COMPANY_123' },
        data: { manager_id: 'USER_456' },
        include: undefined,
        select: undefined,
      });
    });
  });

  describe('getActiveCompanies', () => {
    it('should get all active companies', async () => {
      const mockActiveCompanies = [
        {
          id: 'COMPANY_1',
          company_name: 'Active Company 1',
          status_id: 1,
        },
        {
          id: 'COMPANY_2',
          company_name: 'Active Company 2',
          status_id: 1,
        },
      ];

      mockPrismaClient.company.findMany.mockResolvedValue(mockActiveCompanies);

      const result = await companyRepository.getActiveCompanies();

      expect(result).toEqual(mockActiveCompanies);
      expect(mockPrismaClient.company.findMany).toHaveBeenCalledWith({
        where: { status_id: 1 },
        include: {
          manager: true,
          status: true,
        },
        orderBy: { created_at: 'desc' },
        skip: undefined,
        take: undefined,
        select: undefined,
      });
    });
  });

  describe('getCompanyStatistics', () => {
    it('should get company statistics', async () => {
      const mockCompany = {
        id: 'COMPANY_123',
        company_name: 'Test Company',
        manager: { id: 'USER_123' },
        status: { id: 1, status_name: 'ACTIVE' },
      };

      mockPrismaClient.company.findUnique.mockResolvedValue(mockCompany);
      mockPrismaClient.user.count.mockResolvedValue(25);
      mockPrismaClient.project.count
        .mockResolvedValueOnce(10)  // Total projects
        .mockResolvedValueOnce(5);   // Active projects

      const result = await companyRepository.getCompanyStatistics('COMPANY_123');

      expect(result).toEqual({
        company: mockCompany,
        statistics: {
          employeeCount: 25,
          projectCount: 10,
          activeProjectCount: 5,
        },
      });

      expect(mockPrismaClient.user.count).toHaveBeenCalledWith({
        where: { company_id: 'COMPANY_123' },
      });
      expect(mockPrismaClient.project.count).toHaveBeenCalledTimes(2);
    });
  });

  describe('createWithManager', () => {
    it('should create company with manager', async () => {
      const companyData = {
        company_name: 'New Company',
        company_description: 'Description',
        status_id: 2,
      };
      const managerId = 'USER_123';

      const mockCreatedCompany = {
        id: expect.stringMatching(/^cmp_/),
        ...companyData,
        manager_id: managerId,
      };

      mockPrismaClient.company.create.mockResolvedValue(mockCreatedCompany);

      const result = await companyRepository.createWithManager(companyData, managerId);

      expect(result).toEqual(mockCreatedCompany);
      expect(mockPrismaClient.company.create).toHaveBeenCalledWith({
        data: {
          id: expect.stringMatching(/^cmp_/),
          ...companyData,
          manager_id: managerId,
          created_at: expect.any(Date),
        },
        include: undefined,
        select: undefined,
      });
    });
  });
});