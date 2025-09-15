import 'reflect-metadata';
import { container } from 'tsyringe';

// Mock 생성 헬퍼
import { 
  createMockPrismaService,
  mockPrismaService 
} from '../infrastructure/database/__mocks__/prisma.service.mock';
import { 
  createMockUserRepository,
  mockUserRepository 
} from '../modules/auth/repositories/__mocks__/user.repository.mock';
import { 
  createMockCompanyRepository,
  mockCompanyRepository 
} from '../modules/auth/repositories/__mocks__/company.repository.mock';
import { 
  createMockTokenRepository,
  mockTokenRepository 
} from '../modules/auth/repositories/__mocks__/token.repository.mock';

/**
 * 테스트용 DI Container 설정
 * 실제 서비스 대신 Mock 객체를 주입하여 테스트 환경 구성
 */
class TestDIContainer {
  private static instance: TestDIContainer;
  private isInitialized = false;
  private mockServices: Map<string, any> = new Map();

  private constructor() {}

  /**
   * Singleton 인스턴스 획득
   */
  static getInstance(): TestDIContainer {
    if (!TestDIContainer.instance) {
      TestDIContainer.instance = new TestDIContainer();
    }
    return TestDIContainer.instance;
  }

  /**
   * 테스트용 DI Container 초기화
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 기존 Container 초기화
      container.clearInstances();

      // 1. Mock Infrastructure 등록
      this.registerMockInfrastructure();

      // 2. Mock Repository 등록
      this.registerMockRepositories();

      // 3. Mock Service 등록
      this.registerMockServices();

      // 4. Mock Controller 등록
      this.registerMockControllers();

      this.isInitialized = true;
      console.log('✅ Test DI Container initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Test DI Container:', error);
      throw error;
    }
  }

  /**
   * Mock Infrastructure 등록
   */
  private registerMockInfrastructure(): void {
    // Mock PrismaService
    const mockPrismaServiceInstance = createMockPrismaService();
    this.mockServices.set('PrismaService', mockPrismaServiceInstance);
    container.register('PrismaService', { useValue: mockPrismaServiceInstance });

    // Mock PrismaClient
    container.register('PrismaClient', { useValue: mockPrismaServiceInstance.mockClient });
    
    console.log('🧪 Mock infrastructure registered');
  }

  /**
   * Mock Repository 등록
   */
  private registerMockRepositories(): void {
    // Mock UserRepository
    const mockUserRepositoryInstance = createMockUserRepository();
    this.mockServices.set('UserRepository', mockUserRepositoryInstance);
    container.register('UserRepository', { useValue: mockUserRepositoryInstance });

    // Mock CompanyRepository
    const mockCompanyRepositoryInstance = createMockCompanyRepository();
    this.mockServices.set('CompanyRepository', mockCompanyRepositoryInstance);
    container.register('CompanyRepository', { useValue: mockCompanyRepositoryInstance });

    // Mock TokenRepository
    const mockTokenRepositoryInstance = createMockTokenRepository();
    this.mockServices.set('TokenRepository', mockTokenRepositoryInstance);
    container.register('TokenRepository', { useValue: mockTokenRepositoryInstance });

    console.log('🧪 Mock repositories registered');
  }

  /**
   * Mock Service 등록
   */
  private registerMockServices(): void {
    // 실제 서비스 클래스들은 @injectable로 등록되어 있으므로
    // Mock으로 오버라이드하거나 실제 인스턴스를 사용
    
    // 필요한 경우 특정 서비스를 Mock으로 교체 가능
    // const mockAuthService = createMockAuthService();
    // this.mockServices.set('AuthService', mockAuthService);
    // container.register('AuthService', { useValue: mockAuthService });
    
    console.log('🧪 Mock services registered');
  }

  /**
   * Mock Controller 등록
   */
  private registerMockControllers(): void {
    // Controller는 일반적으로 Mock하지 않고 실제 인스턴스 사용
    // 필요한 경우 특정 Controller를 Mock으로 교체 가능
    
    console.log('🧪 Mock controllers registered');
  }

  /**
   * 특정 Mock 서비스 가져오기
   */
  getMockService<T>(token: string): T {
    return this.mockServices.get(token);
  }

  /**
   * 동적으로 Mock 등록
   */
  registerMock<T>(token: string, mockInstance: T): void {
    this.mockServices.set(token, mockInstance);
    container.register(token, { useValue: mockInstance });
  }

  /**
   * Container에서 인스턴스 가져오기
   */
  resolve<T>(token: string): T {
    return container.resolve<T>(token);
  }

  /**
   * 모든 Mock 초기화
   */
  resetAllMocks(): void {
    this.mockServices.forEach((mockService) => {
      if (mockService && typeof mockService.resetMocks === 'function') {
        mockService.resetMocks();
      }
    });
  }

  /**
   * Container 정리
   */
  clear(): void {
    container.clearInstances();
    this.mockServices.clear();
    this.isInitialized = false;
  }

  /**
   * 초기화 상태 확인
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * 글로벌 Mock 인스턴스들에 대한 편의 메서드
   */
  get mocks() {
    return {
      prismaService: mockPrismaService,
      userRepository: mockUserRepository,
      companyRepository: mockCompanyRepository,
      tokenRepository: mockTokenRepository,
    };
  }
}

// 전역 TestDIContainer 인스턴스
export const testContainer = TestDIContainer.getInstance();

// 편의 함수들
export const initializeTestDI = () => testContainer.initialize();
export const resolveFromTestContainer = <T>(token: string): T => testContainer.resolve<T>(token);
export const registerTestMock = <T>(token: string, mockInstance: T) => 
  testContainer.registerMock(token, mockInstance);
export const getMockService = <T>(token: string): T => testContainer.getMockService<T>(token);
export const resetAllTestMocks = () => testContainer.resetAllMocks();
export const clearTestContainer = () => testContainer.clear();

// Mock 헬퍼 export
export {
  mockPrismaService,
  mockUserRepository,
  mockCompanyRepository,
  mockTokenRepository,
};

export default testContainer;