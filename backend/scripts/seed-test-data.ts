import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// 테스트 환경 변수 로드
dotenv.config({ path: '.env.test', override: true });

async function seedTestData() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log('테스트 기본 데이터 시딩 시작...');

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
    console.log('✅ Roles 테이블 시딩 완료');

    // 2. UserStatus 테이블 시딩
    const userStatuses = [
      { id: 1, status_name: 'ACTIVE' },
      { id: 2, status_name: 'INACTIVE' },
      { id: 3, status_name: 'PENDING' },
    ];

    for (const status of userStatuses) {
      await prisma.userStatus.upsert({
        where: { id: status.id },
        update: {},
        create: status,
      });
    }
    console.log('✅ UserStatus 테이블 시딩 완료');

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
    console.log('✅ CompanyStatus 테이블 시딩 완료');

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
    console.log('✅ ProjectStatus 테이블 시딩 완료');

    // 5. TaskStatus 테이블 시딩
    const taskStatuses = [
      { id: 1, status_name: 'TODO' },
      { id: 2, status_name: 'IN_PROGRESS' },
      { id: 3, status_name: 'REVIEW' },
      { id: 4, status_name: 'COMPLETED' },
      { id: 5, status_name: 'CANCELLED' },
    ];

    for (const status of taskStatuses) {
      await prisma.taskStatus.upsert({
        where: { id: status.id },
        update: {},
        create: status,
      });
    }
    console.log('✅ TaskStatus 테이블 시딩 완료');

    console.log('\n✨ 모든 테스트 기본 데이터 시딩 완료!');
  } catch (error) {
    console.error('시딩 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();
