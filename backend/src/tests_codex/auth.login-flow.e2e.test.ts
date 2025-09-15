import 'reflect-metadata';
import request from 'supertest';
import crypto from 'crypto';
import { createTestApp } from '@/tests/helpers/test-app';
import { createTestHelper, TestHelper } from '@/tests/helpers/test-helper';
import { prismaService } from '@infrastructure/database/prisma.service';

describe('Auth E2E - Login/Password Flow (docs/login.md)', () => {
  let app: any;
  let helper: TestHelper;

  // Shared state across ordered tests
  const state: any = {};

  beforeAll(async () => {
    app = await createTestApp();
    helper = createTestHelper(app);
    // Ensure clean slate for this suite
    await helper.cleanDatabase();
  });

  afterAll(async () => {
    // cleanup is handled by global teardown in setup.ts
  });

  test('1) 시스템 관리자 생성 및 토큰 준비', async () => {
    const admin = await helper.createSystemAdmin();
    const adminToken = helper.generateAccessToken(admin.id, admin.email, admin.role_id);
    expect(admin).toBeTruthy();
    expect(admin.role_id).toBe(1);
    state.admin = admin;
    state.adminToken = adminToken;
  });

  test('2) 회사 관리자 회원가입(PENDING) 및 승인 전 로그인 차단', async () => {
    const { company, manager } = await helper.signupCompanyManager('테스트회사-A', 'manager+flow@test.com', 'Manager123!@#');
    expect(company).toBeTruthy();
    expect(manager).toBeTruthy();
    expect(manager.status_id).toBe(3); // PENDING

    state.company = company;
    state.manager = manager;

    // 승인 전 로그인 시도 → 403 ACCOUNT_PENDING
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'manager+flow@test.com', password: 'Manager123!@#' });
    expect(res.status).toBe(403);
    expect(res.body?.error?.code).toBeDefined();
  });

  test('3) 시스템 관리자의 회사 승인 → 초대 코드 생성', async () => {
    const { adminToken } = state;
    const { company } = state;

    const result = await helper.approveCompanyByAdmin(adminToken, company.id, true);
    expect(result.company.status_id).toBe(1); // ACTIVE
    expect(result.invitationCode).toBeTruthy();

    state.invitationCode = result.invitationCode;
  });

  test('4) 회사 관리자 로그인 성공 및 토큰/쿠키 발급', async () => {
    const login = await helper.login('manager+flow@test.com', 'Manager123!@#');
    expect(login.accessToken).toBeTruthy();
    expect(login.refreshToken).toBeTruthy();
    expect(login.user?.status_id).toBe(1);

    state.managerAccessToken = login.accessToken;
    state.managerRefreshToken = login.refreshToken;
  });

  test('5) 초대 코드로 팀원 회원가입(PENDING) → 관리자 승인', async () => {
    const { invitationCode, managerAccessToken } = state;
    const memberEmail = 'member+flow@test.com';

    const member = await helper.signupTeamMember(invitationCode, memberEmail, 'Member123!@#');
    expect(member.status_id).toBe(3); // PENDING

    await helper.approveMemberByManager(managerAccessToken, member.id);

    // 승인 후 팀원 로그인
    const memberLogin = await helper.login(memberEmail, 'Member123!@#');
    expect(memberLogin.accessToken).toBeTruthy();
    expect(memberLogin.refreshToken).toBeTruthy();

    state.member = member;
    state.memberEmail = memberEmail;
    state.memberAccessToken = memberLogin.accessToken;
    state.memberRefreshToken = memberLogin.refreshToken;
  });

  test('6) Refresh 토큰으로 Access 토큰 갱신(Token Rotation)', async () => {
    const { memberAccessToken, memberRefreshToken } = state;

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Authorization', `Bearer ${memberAccessToken}`)
      .set('Cookie', `refresh_token=${memberRefreshToken}`);

    expect(res.status).toBe(200);
    const newAccess = res.body?.data?.access_token;
    const newRefreshFromCookie = res.headers['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];
    expect(newAccess).toBeTruthy();
    expect(newRefreshFromCookie).toBeTruthy();
    expect(newAccess).not.toBe(memberAccessToken);
    expect(newRefreshFromCookie).not.toBe(memberRefreshToken);

    state.memberAccessToken = newAccess;
    state.memberRefreshToken = newRefreshFromCookie;
  });

  test('7) 로그아웃 → Refresh 쿠키 제거 및 토큰 무효화', async () => {
    const { memberAccessToken, memberRefreshToken } = state;
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${memberAccessToken}`)
      .set('Cookie', `refresh_token=${memberRefreshToken}`);

    expect(res.status).toBe(200);
    const cleared = res.headers['set-cookie']?.[0];
    expect(cleared).toMatch(/refresh_token=;/);
  });

  test('8) 비밀번호 재설정 토큰 저장 → 검증 성공', async () => {
    const { member } = state;
    const token = helper.generateResetToken(member.id);

    // 토큰 해시 및 jti 추출
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const jti = payload.jti;

    const prisma = prismaService.getClient();
    await prisma.passwordResetToken.create({
      data: {
        id: `prt_${Math.random().toString(36).slice(2, 10)}`,
        user_id: member.id,
        jti,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const verify = await request(app).get(`/api/v1/auth/password/verify?token=${token}`);
    expect(verify.status).toBe(200);
    expect(verify.body?.data?.valid).toBe(true);

    state.resetToken = token;
  });

  test('9) 비밀번호 재설정 성공 → 이전 자격증명 무효화', async () => {
    const { resetToken, memberEmail, memberRefreshToken } = state;

    // 새 비밀번호로 재설정
    const reset = await request(app)
      .post('/api/v1/auth/password/reset')
      .send({ token: resetToken, new_password: 'NewSecurePass789!', confirm_password: 'NewSecurePass789!' });

    expect(reset.status).toBe(200);

    // 기존 비밀번호로 로그인 실패
    const failLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: memberEmail, password: 'Member123!@#' });
    expect([401, 403]).toContain(failLogin.status);

    // 새 비밀번호로 로그인 성공
    const okLogin = await helper.login(memberEmail, 'NewSecurePass789!');
    expect(okLogin.accessToken).toBeTruthy();

    // 재설정 이전에 발급된 Refresh 토큰은 무효화되어야 함
    const refreshAttempt = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh_token=${memberRefreshToken}`);
    expect(refreshAttempt.status).toBe(401);
  });
});

