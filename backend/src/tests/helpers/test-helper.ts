import request from 'supertest';
import { Application } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prismaService } from '@infrastructure/database/prisma.service';

// UUID generation function
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export class TestHelper {
  private app: Application;
  private prisma: any;

  constructor(app: Application) {
    this.app = app;
    this.prisma = prismaService.getClient();
  }
  
  // Prisma 클라이언트 접근자 (디버그용)
  prismaClient() {
    return this.prisma;
  }

  // 테스트용 시스템 관리자 생성 (DB 직접 생성 - API 없음)
  async createSystemAdmin() {
    // UUID에서 하이픈 제거하여 올바른 ID 형식 생성
    const adminId = `usr_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const passwordHash = await bcrypt.hash('Admin123!@#', 10);

    const admin = await this.prisma.user.create({
      data: {
        id: adminId,
        email: 'admin@system.com',
        password_hash: passwordHash,
        user_name: '시스템관리자',
        phone_number: '010-0000-0000',
        role_id: 1, // SYSTEM_ADMIN
        status_id: 1, // ACTIVE
      },
    });

    return admin;
  }

  // API를 통한 회사 관리자 회원가입
  async signupCompanyManager(companyName: string = '테스트회사', managerEmail: string = 'manager@test.com', password: string = 'Manager123!@#') {
    const response = await this.post('/api/v1/auth/signup/company-manager', {
      user: {
        email: managerEmail,
        password: password,
        user_name: '김관리자',
        phone_number: '010-1234-5678',
      },
      company: {
        company_name: companyName,
        company_description: '테스트 회사입니다',
      },
    });

    if (response.status !== 201) {
      throw new Error(`회사 관리자 회원가입 실패: ${response.body.message || response.body.error?.message || 'Unknown error'}`);
    }

    // API 응답에서 success와 data 구조 확인
    if (!response.body.success || !response.body.data) {
      throw new Error('회원가입 응답 구조 오류');
    }

    return {
      company: response.body.data.company,
      manager: response.body.data.user,
    };
  }

  // API를 통한 팀원 회원가입
  async signupTeamMember(invitationCode: string, email: string = 'member@test.com', password: string = 'Member123!@#') {
    const response = await this.post('/api/v1/auth/signup/team-member', {
      user: {
        email,
        password,
        user_name: '이팀원',
        phone_number: '010-5678-1234',
      },
      invitation_code: invitationCode,
    });

    if (response.status !== 201) {
      throw new Error(`팀원 회원가입 실패: ${response.body.message || response.body.error?.message || 'Unknown error'}`);
    }

    // API 응답에서 success와 data 구조 확인
    if (!response.body.success || !response.body.data) {
      throw new Error('회원가입 응답 구조 오류');
    }

    // user 객체가 없으면 오류
    if (!response.body.data.user) {
      console.error('응답 데이터:', JSON.stringify(response.body, null, 2));
      throw new Error('회원가입 응답에 user 데이터가 없습니다');
    }

    return response.body.data.user;
  }

  // API를 통한 회사 승인 (시스템 관리자 권한)
  async approveCompanyByAdmin(adminToken: string, companyId: string, generateInvitationCode: boolean = true) {
    const response = await this.postWithAuth(
      '/api/v1/auth/admin/approve/company',
      adminToken,
      {
        company_id: companyId,
        action: 'approve',
        comment: '승인되었습니다',
        generate_invitation_code: generateInvitationCode,
      }
    );

    if (response.status !== 200) {
      throw new Error(`회사 승인 실패: ${response.body.message || response.body.error?.message || 'Unknown error'}`);
    }

    // API 응답 구조 확인
    if (!response.body.data) {
      throw new Error('승인 응답 구조 오류');
    }

    return {
      company: response.body.data.company,
      manager: response.body.data.manager,
      invitationCode: response.body.data.company?.invitation_code,
    };
  }

  // API를 통한 팀원 승인 (회사 관리자 권한)
  async approveMemberByManager(managerToken: string, userId: string) {
    const response = await this.postWithAuth(
      '/api/v1/auth/manager/approve/member',
      managerToken,
      {
        user_id: userId,
        action: 'approve',
        comment: '팀원으로 승인합니다',
      }
    );

    if (response.status !== 200) {
      throw new Error(`팀원 승인 실패: ${response.body.message || response.body.error?.message || 'Unknown error'}`);
    }

    // API 응답 구조 확인
    if (!response.body.data) {
      throw new Error('승인 응답 구조 오류');
    }

    return response.body.data.user;
  }

  // API를 통한 로그인
  async login(email: string, password: string) {
    const response = await this.post('/api/v1/auth/login', {
      email,
      password,
    });

    if (response.status !== 200) {
      console.log('로그인 실패 상세:', {
        status: response.status,
        body: response.body,
        email,
      });
      throw new Error(`로그인 실패: ${response.body.message || response.body.error?.message || 'Unknown error'}`);
    }

    // Refresh Token 쿠키 추출
    let refreshToken = null;
    if (response.headers['set-cookie']) {
      const cookies = response.headers['set-cookie'];
      const refreshCookie = cookies[0]?.split(';')[0]?.split('=')[1];
      refreshToken = refreshCookie;
    }

    return {
      accessToken: response.body.data.access_token,
      refreshToken,
      user: response.body.data.user,
    };
  }

  // API를 통한 로그아웃
  async logout(accessToken: string, refreshToken?: string) {
    const req = request(this.app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    
    if (refreshToken) {
      req.set('Cookie', `refresh_token=${refreshToken}`);
    }

    const response = await req;

    if (response.status !== 200) {
      throw new Error(`로그아웃 실패: ${response.body.error?.message}`);
    }

    return response.body.data;
  }

  // API를 통한 토큰 갱신
  async refreshToken(refreshToken: string) {
    const response = await this.postWithCookie('/api/v1/auth/refresh', refreshToken);

    if (response.status !== 200) {
      throw new Error(`토큰 갱신 실패: ${response.body.message || response.body.error?.message || 'Unknown error'}`);
    }

    // 새 Refresh Token 추출
    let newRefreshToken = null;
    if (response.headers['set-cookie']) {
      const cookies = response.headers['set-cookie'];
      const refreshCookie = cookies[0]?.split(';')[0]?.split('=')[1];
      newRefreshToken = refreshCookie;
    }

    return {
      accessToken: response.body.data.access_token,
      refreshToken: newRefreshToken,
    };
  }

  // API를 통한 비밀번호 재설정 요청
  async forgotPassword(email: string) {
    const response = await this.post('/api/v1/auth/password/forgot', {
      email,
    });

    if (response.status !== 200) {
      throw new Error(`비밀번호 재설정 요청 실패: ${response.body.error?.message}`);
    }

    return response.body;
  }

  // API를 통한 비밀번호 재설정
  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    const response = await this.post('/api/v1/auth/password/reset', {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });

    if (response.status !== 200) {
      throw new Error(`비밀번호 재설정 실패: ${response.body.error?.message}`);
    }

    return response.body;
  }

  // JWT 토큰 생성
  generateAccessToken(userId: string, email: string, roleId: number, companyId?: string) {
    const payload = {
      sub: userId,
      email,
      role_id: roleId,
      company_id: companyId,
      status_id: 1,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900, // 15분
    };

    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'test-access-secret-key-min-32-characters-long');
  }

  // Refresh 토큰 생성
  generateRefreshToken(userId: string) {
    const payload = {
      sub: userId,
      jti: uuidv4(),
      token_family: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30일
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-min-32-characters-long');
  }

  // 비밀번호 재설정 토큰 생성
  generateResetToken(userId: string) {
    const payload = {
      sub: userId,
      purpose: 'password_reset',
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1시간
    };

    return jwt.sign(payload, process.env.JWT_RESET_SECRET || 'test-reset-secret-key-min-32-characters-long');
  }

  // API 요청 헬퍼 함수들
  async post(url: string, data?: any) {
    return request(this.app)
      .post(url)
      .send(data);
  }

  async postWithAuth(url: string, token: string, data?: any) {
    return request(this.app)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
  }

  async postWithCookie(url: string, refreshToken: string, data?: any) {
    return request(this.app)
      .post(url)
      .set('Cookie', `refresh_token=${refreshToken}`)
      .send(data);
  }

  async get(url: string) {
    return request(this.app).get(url);
  }

  async getWithAuth(url: string, token: string) {
    return request(this.app)
      .get(url)
      .set('Authorization', `Bearer ${token}`);
  }

  // 데이터베이스 정리
  async cleanDatabase() {
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
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
      } catch (error: any) {
        // 테이블이 존재하지 않는 경우는 무시 (첫 테스트 실행 시)
        if (error.code !== 'P2010' && !error.message?.includes('does not exist')) {
          console.error(`테이블 ${tablename} 정리 중 오류:`, error.message);
        }
      }
    }
  }

  // 테스트 데이터 시드
  async seedTestData() {
    // 1. 시스템 관리자 생성 (DB 직접)
    const admin = await this.createSystemAdmin();
    
    // 시스템 관리자 로그인하여 실제 토큰 받기
    const adminLoginResult = await this.login('admin@system.com', 'Admin123!@#');
    const adminToken = adminLoginResult.accessToken;

    // 2. 첫 번째 회사 및 관리자 생성 (API 사용)
    const { company: company1, manager: manager1 } = await this.signupCompanyManager('승인된회사', 'approved@test.com');
    
    // 3. 시스템 관리자가 첫 번째 회사 승인 (API 사용)
    const { invitationCode: invitationCode1 } = await this.approveCompanyByAdmin(adminToken, company1.id);
    
    // 4. 첫 번째 회사 관리자 로그인
    const { accessToken: managerToken1 } = await this.login('approved@test.com', 'Manager123!@#');

    // 5. 두 번째 회사 및 관리자 생성 (승인 대기 상태)
    const { company: company2, manager: manager2 } = await this.signupCompanyManager('대기중회사', 'pending@test.com');

    // 6. 첫 번째 회사에 팀원 추가 및 승인
    const member1 = await this.signupTeamMember(invitationCode1, 'active.member@test.com');
    await this.approveMemberByManager(managerToken1, member1.id);

    // 7. 첫 번째 회사에 두 번째 팀원 추가 (승인 대기)
    const member2 = await this.signupTeamMember(invitationCode1, 'pending.member@test.com');

    return {
      admin,
      adminToken,
      companies: [company1, company2],
      managers: [manager1, manager2],
      members: [member1, member2],
      invitationCode: invitationCode1,
      managerToken: managerToken1,
    };
  }
}

// 단일 인스턴스 export
export const createTestHelper = (app: Application) => new TestHelper(app);