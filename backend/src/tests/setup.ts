import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { prismaService } from '@infrastructure/database/prisma.service';

// 테스트 환경 변수 로드 (override: true로 기존 환경변수 덮어쓰기)
dotenv.config({ path: '.env.test', override: true });

// 전역 변수 설정
declare global {
  var __SERVER__: any;
}

// PrismaService의 클라이언트 사용
const prisma = prismaService.getClient();

// 기본 참조 데이터 시딩 함수
async function seedReferenceData(prisma: any) {
  try {
    // 1. Roles 테이블 시딩
    const roles = [
      { id: 1, role_name: 'SYSTEM_ADMIN' },
      { id: 2, role_name: 'COMPANY_MANAGER' },
      { id: 3, role_name: 'TEAM_MEMBER' },
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: { id: role.id },
        update: {},
        create: role,
      });
    }

    // 2. UserStatus 테이블 시딩
    const userStatuses = [
      { id: 1, status_name: 'ACTIVE' },
      { id: 2, status_name: 'INACTIVE' },
      { id: 3, status_name: 'PENDING' },
      { id: 4, status_name: 'SUSPENDED' },
    ];

    for (const status of userStatuses) {
      await prisma.userStatus.upsert({
        where: { id: status.id },
        update: {},
        create: status,
      });
    }

    // 3. CompanyStatus 테이블 시딩
    const companyStatuses = [
      { id: 1, status_name: 'ACTIVE' },
      { id: 2, status_name: 'INACTIVE' },
      { id: 3, status_name: 'PENDING' },
    ];

    for (const status of companyStatuses) {
      await prisma.companyStatus.upsert({
        where: { id: status.id },
        update: {},
        create: status,
      });
    }

    // 4. ProjectStatus 테이블 시딩
    const projectStatuses = [
      { id: 1, status_name: 'PLANNING' },
      { id: 2, status_name: 'IN_PROGRESS' },
      { id: 3, status_name: 'COMPLETED' },
      { id: 4, status_name: 'ON_HOLD' },
      { id: 5, status_name: 'CANCELLED' },
    ];

    for (const status of projectStatuses) {
      await prisma.projectStatus.upsert({
        where: { id: status.id },
        update: {},
        create: status,
      });
    }

    // 5. TaskStatus 테이블 시딩
    const taskStatuses = [
      { id: 1, status_name: 'TODO' },
      { id: 2, status_name: 'IN_PROGRESS' },
      { id: 3, status_name: 'REVIEW' },
      { id: 4, status_name: 'DONE' },
      { id: 5, status_name: 'CANCELLED' },
    ];

    for (const status of taskStatuses) {
      await prisma.taskStatus.upsert({
        where: { id: status.id },
        update: {},
        create: status,
      });
    }
  } catch (error) {
    // 이미 존재하는 데이터는 무시
    console.log('참조 데이터 시딩 중 일부 오류 (무시 가능):', error);
  }
}

// 테스트 환경 설정
beforeAll(async () => {
  // 테스트 DB URL 확인
  const testDbUrl = process.env.DATABASE_URL;
  if (!testDbUrl) {
    throw new Error('테스트 데이터베이스 URL이 설정되지 않았습니다. .env.test 파일을 확인하세요.');
  }

  // 데이터베이스 연결 테스트
  try {
    await prismaService.connect();
    
    // 기본 참조 데이터 시딩
    await seedReferenceData(prisma);
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error);
    throw error;
  }
});

// 각 테스트 수트 실행 전
beforeEach(async () => {
  // 트랜잭션 시작 (롤백을 위해)
  // 각 테스트는 독립적으로 실행됨
});

// 각 테스트 수트 실행 후
afterEach(async () => {
  // E2E 테스트는 연속적인 시나리오를 테스트하므로 
  // 각 테스트 후 데이터를 삭제하지 않음
  // 대신 afterAll에서 전체 정리
});

// 모든 테스트 완료 후
afterAll(async () => {
  // 테스트 데이터 정리
  const tablenames = [
    'token_blacklist',
    'password_reset_tokens',
    'refresh_tokens',
    'activity_logs',
    'reviews',
    'tasks',
    'allocate_projects',
    'projects',
    'users',
    'companies',
  ];

  for (const tablename of tablenames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
    } catch (error: any) {
      // 테이블이 존재하지 않는 경우는 무시
      if (error.code !== 'P2010' && !error.message?.includes('does not exist')) {
        console.error(`테이블 ${tablename} 정리 중 오류:`, error.message);
      }
    }
  }
  
  // 데이터베이스 연결 종료
  await prismaService.disconnect();
});

// 타임아웃 설정
jest.setTimeout(30000);

// Mock 설정
jest.mock('@/shared/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));