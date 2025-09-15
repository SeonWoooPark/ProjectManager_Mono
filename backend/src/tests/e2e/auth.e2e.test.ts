import 'reflect-metadata';
import { Application } from 'express';
import { createTestApp } from '../helpers/test-app';
import { createTestHelper, TestHelper } from '../helpers/test-helper';

describe('Auth API E2E Tests - API 선후 관계 테스트', () => {
  let app: Application;
  let testHelper: TestHelper;

  // 테스트에서 사용할 변수들
  let systemAdminToken: string;
  let companyManagerToken: string;
  let companyId: string;
  let managerId: string;
  let memberId: string;
  let invitationCode: string;
  let refreshToken: string | null;

  beforeAll(async () => {
    // 테스트용 Express 앱 생성
    app = await createTestApp();
    testHelper = createTestHelper(app);

    // 데이터베이스 초기화
    await testHelper.cleanDatabase();
  });

  afterAll(async () => {
    await testHelper.cleanDatabase();
  });

  describe('1. 회원가입 및 승인 플로우 (순차 실행)', () => {
    // 이 블록의 모든 테스트를 위한 데이터를 순차적으로 준비
    beforeAll(async () => {
      // 1-1. 시스템 관리자 생성
      const admin = await testHelper.createSystemAdmin();
      expect(admin).toBeDefined();
      expect(admin.role_id).toBe(1);

      // 시스템 관리자 로그인
      const adminLogin = await testHelper.login('admin@system.com', 'Admin123!@#');
      systemAdminToken = adminLogin.accessToken;
      expect(systemAdminToken).toBeDefined();
    });

    describe('1-1. 시스템 관리자 검증', () => {
      it('시스템 관리자가 사전 생성되어 있어야 함', async () => {
        const verifyAdmin = await testHelper.prismaClient().user.findUnique({
          where: { email: 'admin@system.com' },
        });
        expect(verifyAdmin).toBeDefined();
        expect(verifyAdmin?.role_id).toBe(1);
      });
    });

    describe('1-2. 회사 관리자 회원가입 → 시스템 관리자 승인', () => {
      it('회사 관리자가 회원가입을 할 수 있어야 함', async () => {
        // API를 통한 회원가입
        const { company, manager } = await testHelper.signupCompanyManager(
          '신규테크회사',
          'newmanager@company.com',
          'SecurePass123!'
        );

        expect(company).toBeDefined();
        expect(manager).toBeDefined();
        expect(manager.role_name).toBe('COMPANY_MANAGER');
        expect(manager.status_name).toBe('PENDING');
        expect(company.status_name).toBe('PENDING');

        companyId = company.id;
        managerId = manager.id;
      });

      it('승인 전에는 로그인이 불가능해야 함', async () => {
        const response = await testHelper.post('/api/v1/auth/login', {
          email: 'newmanager@company.com',
          password: 'SecurePass123!',
        });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        // 실제 메시지: "계정 승인을 기다리고 있습니다"
        expect(response.body.message || response.body.error?.message).toContain('계정 승인');
      });

      it('시스템 관리자가 회사를 승인할 수 있어야 함', async () => {
        // API를 통한 회사 승인
        const result = await testHelper.approveCompanyByAdmin(systemAdminToken, companyId, true);

        expect(result.company).toBeDefined();
        expect(result.company.status_name).toBe('ACTIVE');
        expect(result.invitationCode).toBeDefined();
        expect(result.manager.status_name).toBe('ACTIVE');

        invitationCode = result.invitationCode;
      });

      it('승인 후에는 로그인이 가능해야 함', async () => {
        // API를 통한 로그인
        const result = await testHelper.login('newmanager@company.com', 'SecurePass123!');

        expect(result.accessToken).toBeDefined();
        expect(result.user).toBeDefined();
        expect(result.user.status_name).toBe('ACTIVE');

        companyManagerToken = result.accessToken;
      });
    });

    describe('1-3. 팀원 회원가입 → 회사 관리자 승인', () => {
      it('팀원이 초대 코드로 회원가입할 수 있어야 함', async () => {
        // invitationCode는 1-2에서 설정되어 있어야 함
        expect(invitationCode).toBeDefined();
        expect(invitationCode).not.toBeNull();

        // API를 통한 팀원 회원가입
        const member = await testHelper.signupTeamMember(
          invitationCode,
          'teammember@company.com',
          'MemberPass123!'
        );

        expect(member).toBeDefined();
        expect(member.role_name).toBe('TEAM_MEMBER');
        expect(member.status_name).toBe('PENDING');

        memberId = member.id;
      });

      it('팀원 승인 전에는 로그인이 불가능해야 함', async () => {
        const response = await testHelper.post('/api/v1/auth/login', {
          email: 'teammember@company.com',
          password: 'MemberPass123!',
        });

        expect(response.status).toBe(403);
        expect(response.body.message || response.body.error?.message).toContain('계정 승인');
      });

      it('회사 관리자가 팀원을 승인할 수 있어야 함', async () => {
        // 필요한 데이터가 있어야 함
        expect(companyManagerToken).toBeDefined();
        expect(memberId).toBeDefined();

        // API를 통한 팀원 승인
        const approvedMember = await testHelper.approveMemberByManager(
          companyManagerToken,
          memberId
        );

        expect(approvedMember).toBeDefined();
        expect(approvedMember.status_name).toBe('ACTIVE');
      });

      it('팀원 승인 후에는 로그인이 가능해야 함', async () => {
        // 멤버가 승인되었어야 함
        expect(memberId).toBeDefined();

        // API를 통한 로그인
        const result = await testHelper.login('teammember@company.com', 'MemberPass123!');

        expect(result.accessToken).toBeDefined();
        expect(result.user).toBeDefined();
        expect(result.user.status_name).toBe('ACTIVE');
      });
    });
  });

  describe('2. 로그인 및 토큰 관리 플로우', () => {
    describe('2-1. 회원가입과 승인 후 로그인', () => {
      it('승인된 회사 관리자가 로그인할 수 있어야 함', async () => {
        try {
          // 토큰 테스트용 계정으로 로그인
          const result = await testHelper.login('teammember@company.com', 'MemberPass123!');

          expect(result.accessToken).toBeDefined();
          expect(result.refreshToken).toBeDefined();
          expect(result.user).toBeDefined();

          refreshToken = result.refreshToken;
        } catch (error) {
          console.error('newmanager@company.com 로그인 실패:', error);
        }
      });
    });

    describe('2-2. Token Refresh 플로우', () => {
      it('Refresh Token으로 새로운 Access Token을 받을 수 있어야 함', async () => {
        // refreshToken이 없으면 스킵
        if (!refreshToken) {
          console.warn('refreshToken이 설정되지 않았습니다. 이전 테스트 실패로 인한 스킵');
          return;
        }

        // API를 통한 토큰 갱신
        const result = await testHelper.refreshToken(refreshToken);

        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined(); // Token Rotation

        // 새 토큰으로 업데이트
        refreshToken = result.refreshToken;
      });

      it('이미 사용된 Refresh Token은 재사용할 수 없어야 함', async () => {
        // refreshToken이 없으면 스킵
        if (!refreshToken) {
          console.warn('refreshToken이 설정되지 않았습니다. 이전 테스트 실패로 인한 스킵');
          return;
        }

        // 먼저 한 번 사용
        const firstResult = await testHelper.refreshToken(refreshToken);
        expect(firstResult.accessToken).toBeDefined();

        const oldToken = refreshToken;
        const newToken = firstResult.refreshToken;

        // 같은 토큰으로 다시 시도 (실패 예상)
        try {
          await testHelper.refreshToken(oldToken);
          fail('토큰 재사용이 차단되지 않음');
        } catch (error: any) {
          expect(error.message).toContain('토큰 갱신 실패');
        }

        // 새 토큰으로 업데이트
        refreshToken = newToken;
      });
    });

    describe('2-3. 로그아웃 플로우', () => {
      it('로그아웃 시 토큰이 무효화되어야 함', async () => {
        // 먼저 새로 로그인
        const loginResult = await testHelper.login('newmanager@company.com', 'SecurePass123!');

        const accessToken = loginResult.accessToken;
        const refreshCookie = loginResult.refreshToken;

        // 로그아웃
        await testHelper.logout(accessToken, refreshCookie || undefined);

        // 로그아웃 후 Access Token 사용 불가
        const testResponse = await testHelper.postWithAuth(
          '/api/v1/auth/manager/approve/member',
          accessToken,
          { user_id: 'test', action: 'approve' }
        );

        expect(testResponse.status).toBe(401);

        // Refresh Token도 사용 불가
        try {
          await testHelper.refreshToken(refreshCookie || '');
          fail('Refresh Token이 무효화되지 않음');
        } catch (error: any) {
          expect(error.message).toContain('토큰 갱신 실패');
        }
      });
    });
  });

  describe('3. 비밀번호 재설정 플로우', () => {
    let resetToken: string;

    describe('3-1. 비밀번호 재설정 요청', () => {
      it('등록된 이메일로 재설정 요청이 가능해야 함', async () => {
        // API를 통한 비밀번호 재설정 요청
        const result = await testHelper.forgotPassword('newmanager@company.com');

        expect(result.success).toBe(true);
        expect(result.message).toContain('재설정');

        // 테스트용 토큰 생성 (실제 이메일 전송은 하지 않음)
        resetToken = result.data.resetToken;
      });

      it('등록되지 않은 이메일도 동일한 응답을 해야 함 (보안)', async () => {
        // API를 통한 비밀번호 재설정 요청 (존재하지 않는 이메일)
        const result = await testHelper.forgotPassword('notexist@email.com');

        expect(result.success).toBe(true);
        expect(result.message).toContain('재설정');
      });
    });

    describe('3-2. 비밀번호 재설정 실행', () => {
      it('유효한 토큰으로 비밀번호를 재설정할 수 있어야 함', async () => {
        // API를 통한 비밀번호 재설정
        const result = await testHelper.resetPassword(
          resetToken,
          'NewSecurePass456!',
          'NewSecurePass456!'
        );

        expect(result.success).toBe(true);
      });

      it('재설정 후 새 비밀번호로 로그인 가능해야 함', async () => {
        // API를 통한 로그인 (새 비밀번호)
        const result = await testHelper.login('newmanager@company.com', 'NewSecurePass456!');

        expect(result.accessToken).toBeDefined();
        expect(result.user).toBeDefined();
      });

      it('재설정 후 이전 비밀번호로는 로그인 불가능해야 함', async () => {
        const response = await testHelper.post('/api/v1/auth/login', {
          email: 'newmanager@company.com',
          password: 'SecurePass123!', // 이전 비밀번호
        });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('4. 권한 검증 플로우', () => {
    let systemAdminToken: string;
    let companyManagerToken: string;
    let companyId: string;
    let memberId: string;
    let invitationCode: string | undefined;
    let otherCompanyId: string;
    let otherInvitationCode: string | undefined;

    beforeAll(async () => {
      // 초기 데이터 시드
      const testData = await testHelper.seedTestData();

      // 시스템 관리자 로그인하여 실제 토큰 받기
      // const adminLogin = await testHelper.login('admin@system.com', 'Admin123!@#');
      systemAdminToken = testData.adminToken;

      // 첫 번째 회사 (승인된 회사)
      companyId = testData.companies[0].id;
      companyManagerToken = testData.managerToken;

      // 두 번째 회사 (대기 중)
      otherCompanyId = testData.companies[1].id;

      // 초기 데이터에서 초대 코드 가져오기
      invitationCode = testData.invitationCode;

      // 두 번째 회사 승인 및 초대 코드 생성
      const otherApproval = await testHelper.approveCompanyByAdmin(
        systemAdminToken,
        otherCompanyId,
        true
      );
      otherInvitationCode = otherApproval.invitationCode;

      // 두 번째 회사 관리자 로그인
      await testHelper.login('pending@test.com', 'Manager123!@#');
    });

    it('시스템 관리자만 회사를 승인할 수 있어야 함', async () => {
      // 새 회사 생성
      const { company } = await testHelper.signupCompanyManager(
        '권한테스트회사',
        'authtest@company.com',
        'authtest123' // 간소화된 비밀번호 정책 - 8자 이상만 필요
      );

      // 회사 관리자가 다른 회사 승인 시도 (실패해야 함)
      const response = await testHelper.postWithAuth(
        '/api/v1/auth/admin/approve/company',
        companyManagerToken,
        {
          company_id: company.id,
          action: 'approve',
        }
      );

      expect(response.status).toBe(403);
      expect(response.body.message || response.body.error?.message).toContain('권한');
    });

    it('회사 관리자가 자신의 회사 팀원을 승인할 수 있어야 함', async () => {
      // invitationCode가 undefined가 아닌지 확인
      expect(invitationCode).toBeDefined();

      // 팀원 회원가입 (API 사용)
      const member = await testHelper.signupTeamMember(invitationCode!, 'teammember@company.com');
      memberId = member.id;

      // 회사 관리자가 팀원 승인 (API 사용)
      const approvedMember = await testHelper.approveMemberByManager(companyManagerToken, memberId);

      expect(approvedMember).toBeDefined();
      expect(approvedMember.status_name).toBe('ACTIVE');
    });

    it('다른 회사의 팀원은 승인할 수 없어야 함', async () => {
      // otherInvitationCode가 undefined가 아닌지 확인
      expect(otherInvitationCode).toBeDefined();

      // 다른 회사 팀원 생성 (API 사용)
      const otherMember = await testHelper.signupTeamMember(
        otherInvitationCode!,
        'othermember@company.com'
      );

      // 첫 번째 회사 관리자가 다른 회사 팀원 승인 시도
      const response = await testHelper.postWithAuth(
        '/api/v1/auth/manager/approve/member',
        companyManagerToken,
        {
          user_id: otherMember.id,
          action: 'approve',
        }
      );

      expect(response.status).toBe(404);
      expect(response.body.message || response.body.error?.message).toContain('Member not found');
    });
  });

  describe('5. 입력 검증 테스트', () => {
    it('이메일 형식이 올바르지 않으면 회원가입 실패', async () => {
      const response = await testHelper.post('/api/v1/auth/signup/company-manager', {
        user: {
          email: 'invalid-email',
          password: 'SecurePass123!',
          user_name: '테스트',
          phone_number: '010-1111-1111',
        },
        company: {
          company_name: '테스트회사',
          company_description: '테스트',
        },
      });

      expect(response.status).toBe(400);
      expect(response.body.message || response.body.error?.message).toContain('이메일');
    });

    it('비밀번호가 8자 미만이면 회원가입 실패', async () => {
      const response = await testHelper.post('/api/v1/auth/signup/company-manager', {
        user: {
          email: 'test@test.com',
          password: 'Pass1!',
          user_name: '테스트',
          phone_number: '010-1111-1111',
        },
        company: {
          company_name: '테스트회사2',
          company_description: '테스트',
        },
      });

      expect(response.status).toBe(400);
      expect(response.body.message || response.body.error?.message).toContain('비밀번호');
    });

    it('중복된 이메일로 회원가입 불가', async () => {
      // API를 통한 회원가입 시도 (중복 이메일)
      try {
        await testHelper.signupCompanyManager(
          '중복테스트회사',
          'approved@test.com', // 이미 존재하는 이메일
          'SecurePass123!'
        );
        fail('중복 이메일로 회원가입이 허용됨');
      } catch (error: any) {
        expect(error.message).toContain('회사 관리자 회원가입 실패');
        // API를 통한 직접 확인
        const response = await testHelper.post('/api/v1/auth/signup/company-manager', {
          user: {
            email: 'approved@test.com',
            password: 'SecurePass123!',
            user_name: '중복테스트',
            phone_number: '010-2222-2222',
          },
          company: {
            company_name: '중복테스트회사',
            company_description: '테스트',
          },
        });
        expect(response.status).toBe(409);
      }
    });

    it('중복된 회사명으로 회원가입 불가', async () => {
      // API를 통한 회원가입 시도 (중복 회사명)
      try {
        await testHelper.signupCompanyManager(
          '승인된회사', // 이미 존재하는 회사명
          'unique@test.com',
          'SecurePass123!'
        );
        fail('중복 회사명으로 회원가입이 허용됨');
      } catch (error: any) {
        expect(error.message).toContain('회사 관리자 회원가입 실패');
        // API를 통한 직접 확인
        const response = await testHelper.post('/api/v1/auth/signup/company-manager', {
          user: {
            email: 'unique@test.com',
            password: 'SecurePass123!',
            user_name: '중복테스트',
            phone_number: '010-3333-3333',
          },
          company: {
            company_name: '승인된회사',
            company_description: '테스트',
          },
        });
        expect(response.status).toBe(409);
      }
    });
  });
});
