import { jest } from '@jest/globals';
import { Company } from '@prisma/client';
import { ICompanyRepository } from '@shared/interfaces/repository.interfaces';

/**
 * CompanyRepository Mock Implementation
 * 모든 CompanyRepository 메서드를 jest.Mock으로 구현
 */
export class MockCompanyRepository implements ICompanyRepository {
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

  // ICompanyRepository specific methods
  public findByName = jest.fn() as any;
  public findPendingCompanies = jest.fn() as any;
  public updateApprovalStatus = jest.fn() as any;

  // Additional CompanyRepository methods
  public generateInvitationCode = jest.fn() as any;
  public findByInvitationCode = jest.fn() as any;
  public findWithEmployees = jest.fn() as any;
  public updateManager = jest.fn() as any;
  public getActiveCompanies = jest.fn() as any;
  public getCompanyStatistics = jest.fn() as any;
  public createWithManager = jest.fn() as any;

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
    this.create.mockResolvedValue(this.createMockCompany());
    this.update.mockResolvedValue(this.createMockCompany());
    this.delete.mockResolvedValue(this.createMockCompany());
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

    // ICompanyRepository methods
    this.findByName.mockResolvedValue(null);
    this.findPendingCompanies.mockResolvedValue([]);
    this.updateApprovalStatus.mockResolvedValue(this.createMockCompany({ status_id: 1 }));

    // Additional methods
    this.generateInvitationCode.mockResolvedValue('ABC123');
    this.findByInvitationCode.mockResolvedValue(null);
    this.findWithEmployees.mockResolvedValue(null);
    this.updateManager.mockResolvedValue(this.createMockCompany());
    this.getActiveCompanies.mockResolvedValue([]);
    this.getCompanyStatistics.mockResolvedValue({
      company: this.createMockCompany(),
      statistics: {
        employeeCount: 0,
        projectCount: 0,
        activeProjectCount: 0,
      },
    });
    this.createWithManager.mockResolvedValue(this.createMockCompany());
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
      invitation_code: 'ABC123',
      manager_id: 'USER_manager123',
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      ...overrides,
    };
  }

  /**
   * Mock Company with relations
   */
  private createMockCompanyWithRelations(overrides?: any): any {
    const baseCompany = this.createMockCompany(overrides);
    return {
      ...baseCompany,
      manager: {
        id: 'USER_manager123',
        name: 'Manager User',
        email: 'manager@test.com',
        role_id: 2,
      },
      status: {
        id: 1,
        status_name: 'ACTIVE',
      },
      employees: [],
      projects: [],
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

  public mockCompanyExists(company?: Partial<Company>): Company {
    const mockCompany = this.createMockCompany(company);
    this.findById.mockResolvedValue(mockCompany);
    this.findByName.mockResolvedValue(mockCompany);
    return mockCompany;
  }

  public mockCompanyNotFound(): void {
    this.findById.mockResolvedValue(null);
    this.findByName.mockResolvedValue(null);
    this.findByInvitationCode.mockResolvedValue(null);
    this.findWithEmployees.mockResolvedValue(null);
  }

  public mockCompanyWithInvitationCode(code: string, company?: Partial<Company>): Company {
    const mockCompany = this.createMockCompany({ invitation_code: code, ...company });
    this.findByInvitationCode.mockResolvedValue(mockCompany);
    return mockCompany;
  }

  public mockPendingCompanies(companies?: Partial<Company>[]): Company[] {
    const mockCompanies = companies?.map(company => 
      this.createMockCompanyWithRelations({ 
        status_id: 2, // PENDING
        ...company 
      })
    ) || [];
    
    this.findPendingCompanies.mockResolvedValue(mockCompanies);
    return mockCompanies;
  }

  public mockActiveCompanies(companies?: Partial<Company>[]): Company[] {
    const mockCompanies = companies?.map(company => 
      this.createMockCompanyWithRelations({ 
        status_id: 1, // ACTIVE
        ...company 
      })
    ) || [];
    
    this.getActiveCompanies.mockResolvedValue(mockCompanies);
    return mockCompanies;
  }

  public mockCompanyWithEmployees(
    companyData?: Partial<Company>,
    employees?: any[],
    projects?: any[]
  ): any {
    const mockCompany = this.createMockCompanyWithRelations({
      ...companyData,
      employees: employees || [],
      projects: projects || [],
    });
    
    this.findWithEmployees.mockResolvedValue(mockCompany);
    return mockCompany;
  }

  public mockCompanyStatistics(
    companyData?: Partial<Company>,
    statistics?: {
      employeeCount?: number;
      projectCount?: number;
      activeProjectCount?: number;
    }
  ): any {
    const result = {
      company: this.createMockCompanyWithRelations(companyData),
      statistics: {
        employeeCount: 0,
        projectCount: 0,
        activeProjectCount: 0,
        ...statistics,
      },
    };
    
    this.getCompanyStatistics.mockResolvedValue(result);
    return result;
  }

  public mockSuccessfulApproval(statusId: number, invitationCode?: string): Company {
    const approvedCompany = this.createMockCompanyWithRelations({
      status_id: statusId,
      invitation_code: invitationCode || 'ABC123',
    });
    
    this.updateApprovalStatus.mockResolvedValue(approvedCompany);
    return approvedCompany;
  }

  public mockUniqueInvitationCode(code: string): void {
    this.generateInvitationCode.mockResolvedValue(code);
    // First call returns null (no existing), ensuring uniqueness
    this.findOne.mockResolvedValueOnce(null);
  }

  public mockDuplicateInvitationCode(code: string, attempts: number = 2): void {
    const existingCompany = this.createMockCompany({ invitation_code: code });
    
    // Mock multiple attempts to find unique code
    for (let i = 0; i < attempts - 1; i++) {
      this.findOne.mockResolvedValueOnce(existingCompany);
    }
    // Last attempt should return null (unique)
    this.findOne.mockResolvedValueOnce(null);
    
    this.generateInvitationCode.mockResolvedValue(code);
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
    this.createWithManager.mockRejectedValue(error);
  }

  /**
   * 특정 메서드만 성공하도록 설정하는 헬퍼
   */
  public mockSuccessfulUpdate(company?: Partial<Company>): Company {
    const mockCompany = this.createMockCompany(company);
    this.update.mockResolvedValue(mockCompany);
    this.updateApprovalStatus.mockResolvedValue(mockCompany);
    this.updateManager.mockResolvedValue(mockCompany);
    return mockCompany;
  }

  public mockSuccessfulCreate(company?: Partial<Company>): Company {
    const mockCompany = this.createMockCompany(company);
    this.create.mockResolvedValue(mockCompany);
    this.createWithManager.mockResolvedValue(mockCompany);
    return mockCompany;
  }
}

/**
 * Factory functions
 */
export const createMockCompanyRepository = (): MockCompanyRepository => {
  return new MockCompanyRepository();
};

/**
 * Singleton instance for consistent mocking
 */
export const mockCompanyRepository = createMockCompanyRepository();

/**
 * Jest mock implementation for DI container
 */
export const MockCompanyRepositoryImplementation = (): ICompanyRepository => {
  return mockCompanyRepository;
};