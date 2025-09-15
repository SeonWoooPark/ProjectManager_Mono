import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// 테스트 환경 변수 로드
dotenv.config({ path: '.env.test', override: true });

async function testSchema() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: ['query'], // SQL 쿼리 로깅 활성화
  });

  try {
    console.log('\n테스트 1: users 테이블 조회 시도...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('성공! 조회된 사용자 수:', users.length);
  } catch (error: any) {
    console.error('실패:', error.message);
    if (error.message.includes('pm.users')) {
      console.error('=> Prisma가 pm 스키마를 사용하고 있습니다 (pm_test가 아님)');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testSchema();
