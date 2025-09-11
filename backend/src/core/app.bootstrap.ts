import 'reflect-metadata';
import { diContainer, initializeDI } from './container';
import { logger } from '@shared/utils/logger';

/**
 * 애플리케이션 부트스트랩 클래스
 * DI Container 초기화 및 애플리케이션 설정 관리
 */
export class AppBootstrap {
  private static instance: AppBootstrap;
  private isInitialized = false;

  private constructor() {}

  /**
   * Singleton 인스턴스 획득
   */
  static getInstance(): AppBootstrap {
    if (!AppBootstrap.instance) {
      AppBootstrap.instance = new AppBootstrap();
    }
    return AppBootstrap.instance;
  }

  /**
   * 애플리케이션 초기화
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('🚀 Initializing application...');

      // 1. DI Container 초기화
      await this.initializeDIContainer();

      // 2. 환경별 설정 적용
      this.configureEnvironment();

      // 3. 추가 설정들
      this.configureAdditionalSettings();

      this.isInitialized = true;
      logger.info('✅ Application initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * DI Container 초기화
   */
  private async initializeDIContainer(): Promise<void> {
    logger.info('📦 Initializing DI Container...');
    await initializeDI();
  }

  /**
   * 환경별 설정 적용
   */
  private configureEnvironment(): void {
    const env = process.env.NODE_ENV || 'development';
    
    logger.info(`🔧 Configuring for environment: ${env}`);

    switch (env) {
      case 'development':
        this.configureDevelopment();
        break;
      case 'production':
        this.configureProduction();
        break;
      case 'test':
        this.configureTest();
        break;
      default:
        logger.warn(`Unknown environment: ${env}, using development config`);
        this.configureDevelopment();
    }
  }

  /**
   * 개발 환경 설정
   */
  private configureDevelopment(): void {
    // 개발 환경 특화 설정
    logger.info('🔧 Development configuration applied');
  }

  /**
   * 프로덕션 환경 설정
   */
  private configureProduction(): void {
    // 프로덕션 환경 특화 설정
    logger.info('🔧 Production configuration applied');
  }

  /**
   * 테스트 환경 설정
   */
  private configureTest(): void {
    // 테스트 환경 특화 설정
    logger.info('🔧 Test configuration applied');
  }

  /**
   * 추가 설정들
   */
  private configureAdditionalSettings(): void {
    // 향후 추가 설정들 (예: Cache, External Services 등)
    logger.info('🔧 Additional settings configured');
  }

  /**
   * 컨테이너에서 인스턴스 획득
   */
  resolve<T>(token: string): T {
    return diContainer.resolve<T>(token);
  }

  /**
   * 초기화 상태 확인
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * 애플리케이션 종료 시 정리
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      logger.info('🔄 Shutting down application...');
      
      // DI Container 정리
      diContainer.clear();
      
      this.isInitialized = false;
      logger.info('✅ Application shutdown completed');
    } catch (error) {
      logger.error('❌ Error during application shutdown:', error);
      throw error;
    }
  }
}

// 전역 AppBootstrap 인스턴스
export const appBootstrap = AppBootstrap.getInstance();

// 편의 함수들
export const initializeApp = () => appBootstrap.initialize();
export const resolveFromContainer = <T>(token: string): T => appBootstrap.resolve<T>(token);
export const shutdownApp = () => appBootstrap.shutdown();