import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSystemAdmin() {
  try {
    // 기존 admin 계정 확인
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin' }
    });

    if (existingAdmin) {
      console.log('❌ 시스템 관리자 계정이 이미 존재합니다.');
      console.log('   Email:', existingAdmin.email);
      console.log('   ID:', existingAdmin.id);
      return;
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash('admin', 10);
    console.log('🔐 비밀번호 해시 생성 완료');

    // 시스템 관리자 계정 생성
    const admin = await prisma.user.create({
      data: {
        id: 'usr_admin01',           // ID 패턴: usr_로 시작하고 6자 이상의 영숫자
        email: 'admin',               // 이메일
        password_hash: passwordHash,  // bcrypt 해시된 비밀번호
        user_name: '시스템 관리자',    // 사용자 이름
        phone_number: null,           // 전화번호 (선택사항)
        role_id: 1,                   // 1 = SYSTEM_ADMIN
        status_id: 1,                 // 1 = ACTIVE
        company_id: null,             // 시스템 관리자는 회사 소속 아님
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ 시스템 관리자 계정이 성공적으로 생성되었습니다!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin');
    console.log('🆔 User ID:', admin.id);
    console.log('👤 Name:', admin.user_name);
    console.log('🎭 Role ID:', admin.role_id, '(SYSTEM_ADMIN)');
    console.log('📊 Status ID:', admin.status_id, '(ACTIVE)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 비밀번호 검증 테스트
    const isValid = await bcrypt.compare('admin', admin.password_hash);
    console.log('🔓 비밀번호 검증:', isValid ? '✅ 성공' : '❌ 실패');

    // 역할 정보 조회
    const role = await prisma.role.findUnique({
      where: { id: admin.role_id }
    });
    
    if (role) {
      console.log('👑 역할:', role.role_name);
    }

    // 상태 정보 조회
    const status = await prisma.userStatus.findUnique({
      where: { id: admin.status_id }
    });
    
    if (status) {
      console.log('📌 상태:', status.status_name);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    if (error instanceof Error) {
      console.error('   메시지:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
createSystemAdmin()
  .then(() => {
    console.log('\n✨ 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 스크립트 실행 실패:', error);
    process.exit(1);
  });