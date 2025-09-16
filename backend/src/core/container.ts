import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

// Infrastructure
import { PrismaService } from '@infrastructure/database/prisma.service';

// Auth Module Repositories
import { UserRepository } from '@modules/auth/repositories/user.repository';
import { CompanyRepository } from '@modules/auth/repositories/company.repository';
import { TokenRepository } from '@modules/auth/repositories/token.repository';

// Auth Module Services
import { AuthenticationService } from '@modules/auth/services/authentication.service';
import { TokenService } from '@modules/auth/services/token.service';
import { PasswordService } from '@modules/auth/services/password.service';
import { RegistrationService } from '@modules/auth/services/registration.service';
import { ApprovalService } from '@modules/auth/services/approval.service';
import { AuthService } from '@modules/auth/services/auth.service';

// Auth Module Controllers
import { AuthController } from '@modules/auth/controllers/auth.controller';

// Projects Module - Temporarily disabled due to type errors
// import { ProjectsRepository } from '@modules/projects/repositories/projects.repository';
// import { ProjectsService } from '@modules/projects/services/projects.service';
// import { ProjectsController } from '@modules/projects/controllers/projects.controller';

// Tasks Module - Temporarily disabled due to type errors
// import { TasksRepository } from '@modules/tasks/repositories/tasks.repository';
// import { TasksService } from '@modules/tasks/services/tasks.service';
// import { TasksController } from '@modules/tasks/controllers/tasks.controller';

// Members Module - Temporarily disabled due to type errors
// import { MembersRepository } from '@modules/members/repositories/members.repository';
// import { MembersService } from '@modules/members/services/members.service';
// import { MembersController } from '@modules/members/controllers/members.controller';

// Cache Services (for future implementation)
// import { RedisClient } from '@infrastructure/cache/redis.client';

/**
 * DI Container 설정 및 의존성 등록
 * Singleton 패턴으로 관리되는 서비스들을 등록
 */
class DIContainer {
  private static instance: DIContainer;
  private isInitialized = false;

  private constructor() {}

  /**
   * Singleton 인스턴스 획득
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * 의존성 등록 및 컨테이너 초기화
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 1. Infrastructure 레이어 등록
      this.registerInfrastructure();

      // 2. Repository 레이어 등록
      this.registerRepositories();

      // 3. Service 레이어 등록
      this.registerServices();

      // 4. Controller 레이어 등록
      this.registerControllers();

      // 5. 추가 설정
      this.registerAdditionalServices();

      this.isInitialized = true;
      console.log('✅ DI Container initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize DI Container:', error);
      throw error;
    }
  }

  /**
   * Infrastructure 레이어 의존성 등록
   */
  private registerInfrastructure(): void {
    // PrismaClient 싱글톤 등록
    container.registerSingleton<PrismaClient>('PrismaClient', PrismaClient);
    
    // PrismaService 싱글톤 등록 (getInstance를 통해 인스턴스 등록)
    container.registerInstance<PrismaService>('PrismaService', PrismaService.getInstance());
    
    console.log('📦 Infrastructure dependencies registered');
  }

  /**
   * Repository 레이어 의존성 등록
   */
  private registerRepositories(): void {
    // Auth 모듈 Repositories
    container.registerSingleton<UserRepository>('UserRepository', UserRepository);
    container.registerSingleton<CompanyRepository>('CompanyRepository', CompanyRepository);
    container.registerSingleton<TokenRepository>('TokenRepository', TokenRepository);
    
    // Projects/Tasks/Members 모듈 Repositories - All temporarily disabled due to type errors
    // container.registerSingleton<ProjectsRepository>('ProjectsRepository', ProjectsRepository);
    // container.registerSingleton<TasksRepository>('TasksRepository', TasksRepository);
    // container.registerSingleton<MembersRepository>('MembersRepository', MembersRepository);
    
    console.log('🏪 Repository dependencies registered');
  }

  /**
   * Service 레이어 의존성 등록
   */
  private registerServices(): void {
    // 기본 서비스들
    container.registerSingleton<PasswordService>('PasswordService', PasswordService);
    container.registerSingleton<TokenService>('TokenService', TokenService);
    
    // 비즈니스 로직 서비스들
    container.registerSingleton<AuthenticationService>('AuthenticationService', AuthenticationService);
    container.registerSingleton<RegistrationService>('RegistrationService', RegistrationService);
    container.registerSingleton<ApprovalService>('ApprovalService', ApprovalService);
    
    // Facade 서비스
    container.registerSingleton<AuthService>('AuthService', AuthService);
    
    // Projects/Tasks/Members 서비스 - All temporarily disabled due to type errors
    // container.registerSingleton<ProjectsService>('ProjectsService', ProjectsService);
    // container.registerSingleton<TasksService>('TasksService', TasksService);
    // container.registerSingleton<MembersService>('MembersService', MembersService);
    
    console.log('⚙️ Service dependencies registered');
  }

  /**
   * Controller 레이어 의존성 등록
   */
  private registerControllers(): void {
    // Auth 모듈 Controllers
    container.registerSingleton<AuthController>('AuthController', AuthController);
    
    // Projects/Tasks/Members 모듈 Controllers - All temporarily disabled due to type errors
    // container.registerSingleton<ProjectsController>('ProjectsController', ProjectsController);
    // container.registerSingleton<TasksController>('TasksController', TasksController);
    // container.registerSingleton<MembersController>('MembersController', MembersController);
    
    console.log('🎮 Controller dependencies registered');
  }

  /**
   * 추가 서비스 등록 (캐시, 외부 서비스 등)
   */
  private registerAdditionalServices(): void {
    // 향후 Redis, Email Service 등 추가 예정
    // container.registerSingleton<RedisClient>('RedisClient', RedisClient);
    
    console.log('🔧 Additional services registered');
  }

  /**
   * 등록된 의존성 획득
   */
  resolve<T>(token: string): T {
    return container.resolve<T>(token);
  }

  /**
   * 테스트용 Mock 등록
   */
  registerMock<T>(token: string, mockInstance: T): void {
    container.register<T>(token, { useValue: mockInstance });
  }

  /**
   * 의존성 해제 (테스트 후 정리용)
   */
  clear(): void {
    container.clearInstances();
    this.isInitialized = false;
  }

  /**
   * 초기화 상태 확인
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// 전역 DI Container 인스턴스
export const diContainer = DIContainer.getInstance();

// 편의 함수들
export const initializeDI = () => diContainer.initialize();
export const resolve = <T>(token: string): T => diContainer.resolve<T>(token);
export const registerMock = <T>(token: string, mockInstance: T) => 
  diContainer.registerMock(token, mockInstance);

export default diContainer;
