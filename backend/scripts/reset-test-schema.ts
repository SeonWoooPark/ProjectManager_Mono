import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// 테스트 환경 변수 로드
dotenv.config({ path: '.env.test' });

async function resetTestSchema() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log('테스트 스키마 리셋 시작...');
    
    // 모든 테이블 삭제 (CASCADE로 의존성 함께 제거)
    const tables = [
      'password_reset_tokens',
      'refresh_tokens',
      'activity_logs',
      'tasks',
      'projects',
      'users',
      'companies'
    ];

    console.log('테이블 삭제 중...');
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`- ${table} 테이블 삭제됨`);
      } catch (error) {
        console.log(`- ${table} 테이블 삭제 실패 (무시):`, error);
      }
    }

    // _prisma_migrations 테이블도 삭제하여 마이그레이션 상태 초기화
    try {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "_prisma_migrations" CASCADE`);
      console.log('- _prisma_migrations 테이블 삭제됨');
    } catch (error) {
      // 혹시 public 스키마에 있을 수 있음
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS public."_prisma_migrations" CASCADE`);
      console.log('- public._prisma_migrations 테이블 삭제됨');
    }

    console.log('테스트 스키마 리셋 완료!');
  } catch (error) {
    console.error('스키마 리셋 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetTestSchema();