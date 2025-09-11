import 'reflect-metadata';
import { initializeTestDI, clearTestContainer } from '@core/test-container';

/**
 * 전역 테스트 설정
 * 모든 테스트 실행 전/후에 DI Container 관리
 */

// Jest 전역 설정
beforeAll(async () => {
  await initializeTestDI();
});

afterAll(() => {
  clearTestContainer();
});

// 각 테스트 파일별 설정은 해당 파일에서 처리
// beforeEach/afterEach는 각 테스트 파일에서 구체적으로 설정