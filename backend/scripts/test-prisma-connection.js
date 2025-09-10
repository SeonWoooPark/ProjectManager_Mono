require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testPrismaConnection() {
  console.log('🔍 Prisma 연결 테스트 시작...\n');
  
  try {
    // 1. 데이터베이스 연결 테스트
    console.log('1️⃣ 데이터베이스 연결 중...');
    await prisma.$connect();
    console.log('✅ 데이터베이스 연결 성공!\n');

    // 2. 사용자 수 조회
    console.log('2️⃣ 사용자 수 조회 중...');
    const userCount = await prisma.user.count();
    console.log(`✅ 전체 사용자 수: ${userCount}명\n`);

    // 3. 첫 번째 사용자 조회
    console.log('3️⃣ 첫 번째 사용자 정보 조회 중...');
    const firstUser = await prisma.user.findFirst({
      include: {
        role: true,
        status: true,
        company: true,
      }
    });
    
    if (firstUser) {
      console.log('✅ 사용자 정보:');
      console.log(`   - ID: ${firstUser.id}`);
      console.log(`   - 이름: ${firstUser.user_name}`);
      console.log(`   - 이메일: ${firstUser.email}`);
      console.log(`   - 역할: ${firstUser.role?.role_name || 'N/A'}`);
      console.log(`   - 상태: ${firstUser.status?.status_name || 'N/A'}`);
      console.log(`   - 회사: ${firstUser.company?.company_name || 'N/A'}\n`);
    } else {
      console.log('⚠️  사용자가 없습니다.\n');
    }

    // 4. 프로젝트 수 조회
    console.log('4️⃣ 프로젝트 수 조회 중...');
    const projectCount = await prisma.project.count();
    console.log(`✅ 전체 프로젝트 수: ${projectCount}개\n`);

    // 5. 작업 수 조회
    console.log('5️⃣ 작업 수 조회 중...');
    const taskCount = await prisma.task.count();
    console.log(`✅ 전체 작업 수: ${taskCount}개\n`);

    // 6. 회사 수 조회
    console.log('6️⃣ 회사 수 조회 중...');
    const companyCount = await prisma.company.count();
    console.log(`✅ 전체 회사 수: ${companyCount}개\n`);

    // 7. 스키마 확인
    console.log('7️⃣ 스키마 관계 테스트...');
    const userWithRelations = await prisma.user.findFirst({
      include: {
        role: true,
        status: true,
        company: true,
        managedCompany: true,
        tasks: {
          take: 1
        },
        allocatedProjects: {
          take: 1,
          include: {
            project: true
          }
        }
      }
    });
    
    if (userWithRelations) {
      console.log('✅ 관계 데이터 로드 성공:');
      console.log(`   - 할당된 작업: ${userWithRelations.tasks.length}개`);
      console.log(`   - 할당된 프로젝트: ${userWithRelations.allocatedProjects.length}개`);
      console.log(`   - 관리 회사: ${userWithRelations.managedCompany ? '있음' : '없음'}\n`);
    }

    console.log('🎉 모든 테스트 통과! Prisma가 정상적으로 작동합니다.\n');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    console.error('\n💡 문제 해결 방법:');
    console.error('   1. DATABASE_URL이 올바른지 확인하세요');
    console.error('   2. 데이터베이스 서버가 실행 중인지 확인하세요');
    console.error('   3. npx prisma generate를 실행했는지 확인하세요');
  } finally {
    await prisma.$disconnect();
    console.log('📴 데이터베이스 연결 종료');
  }
}

testPrismaConnection();