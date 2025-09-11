import request from 'supertest';
import express from 'express';
import { AuthValidator } from '../../modules/auth/validators/auth.validator';
import { ValidationError } from '../../utils/errors';

describe('AuthValidator', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  });

  describe('validateLogin', () => {
    beforeEach(() => {
      app.post('/test', AuthValidator.validateLogin(), (_req, res) => {
        res.json({ success: true });
      });

      // Error handler
      app.use((err: any, _req: any, res: any, _next: any) => {
        if (err instanceof ValidationError) {
          return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Internal server error' });
      });
    });

    it('should pass with valid email and password', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'invalid-email',
          password: 'Test123!@#'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('유효한 이메일을 입력해주세요');
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('비밀번호는 8~128자 사이여야 합니다');
    });

    it('should fail with missing password', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('validateCompanyManagerSignup', () => {
    beforeEach(() => {
      app.post('/test', AuthValidator.validateCompanyManagerSignup(), (_req, res) => {
        res.json({ success: true });
      });

      app.use((err: any, _req: any, res: any, _next: any) => {
        if (err instanceof ValidationError) {
          return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Internal server error' });
      });
    });

    it('should pass with valid company manager signup data', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          user: {
            email: 'manager@test.com',
            password: 'Manager123!@#',
            user_name: '관리자',
            phone_number: '010-1234-5678'
          },
          company: {
            company_name: '테스트 회사',
            company_description: '테스트 회사 설명'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should fail with invalid nested email', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          user: {
            email: 'invalid-email',
            password: 'Manager123!@#',
            user_name: '관리자'
          },
          company: {
            company_name: '테스트 회사'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('유효한 이메일을 입력해주세요');
    });

    it('should fail with missing company name', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          user: {
            email: 'manager@test.com',
            password: 'Manager123!@#',
            user_name: '관리자'
          },
          company: {}
        });

      expect(response.status).toBe(400);
    });
  });

  describe('validateTeamMemberSignup', () => {
    beforeEach(() => {
      app.post('/test', AuthValidator.validateTeamMemberSignup(), (_req, res) => {
        res.json({ success: true });
      });

      app.use((err: any, _req: any, res: any, _next: any) => {
        if (err instanceof ValidationError) {
          return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Internal server error' });
      });
    });

    it('should pass with valid team member signup data', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          user: {
            email: 'member@test.com',
            password: 'Member123!@#',
            user_name: '팀원',
            phone_number: '010-1234-5678'
          },
          invitation_code: 'ABCD1234'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should fail with missing invitation code', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          user: {
            email: 'member@test.com',
            password: 'Member123!@#',
            user_name: '팀원'
          }
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('토큰이 유효하지 않습니다');
    });
  });

  describe('validateCompanyApproval', () => {
    beforeEach(() => {
      app.post('/test', AuthValidator.validateCompanyApproval(), (_req, res) => {
        res.json({ success: true });
      });

      app.use((err: any, _req: any, res: any, _next: any) => {
        if (err instanceof ValidationError) {
          return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Internal server error' });
      });
    });

    it('should pass with valid approval data', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          company_id: 'cmp_123456',
          action: 'approve',
          comment: '승인합니다',
          generate_invitation_code: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should fail with invalid action', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          company_id: 'cmp_123456',
          action: 'invalid_action'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('유효한 액션을 선택해주세요');
    });

    it('should fail with invalid company_id format', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          company_id: 'invalid-id',
          action: 'approve'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('올바른 company_id 형식이 아닙니다');
    });
  });

  describe('validateResetPassword', () => {
    beforeEach(() => {
      app.post('/test', AuthValidator.validateResetPassword(), (_req: any, res: any) => {
        res.json({ success: true });
      });

      app.use((err: any, _req: any, res: any, _next: any) => {
        if (err instanceof ValidationError) {
          return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Internal server error' });
      });
    });

    it('should pass with valid reset password data', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          token: 'valid-reset-token-12345',
          new_password: 'NewPass123!@#',
          confirm_password: 'NewPass123!@#'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should fail when passwords do not match', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          token: 'valid-reset-token-12345',
          new_password: 'NewPass123!@#',
          confirm_password: 'DifferentPass123!@#'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('비밀번호와 비밀번호 확인이 일치하지 않습니다');
    });

    it('should fail with weak new password', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          token: 'valid-reset-token-12345',
          new_password: 'weak',
          confirm_password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('비밀번호는 8~128자 사이여야 합니다');
    });

    it('should fail with missing token', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          new_password: 'NewPass123!@#',
          confirm_password: 'NewPass123!@#'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('토큰이 유효하지 않습니다');
    });
  });

  describe('formatErrorMessage', () => {
    it('should return Korean message by default', () => {
      const message = AuthValidator.formatErrorMessage('Invalid email');
      expect(message).toBe('유효한 이메일을 입력해주세요');
    });

    it('should return English message when requested', () => {
      const message = AuthValidator.formatErrorMessage('유효한 이메일을 입력해주세요', 'en');
      expect(message).toBe('Please enter a valid email address');
    });

    it('should return original message if no translation exists', () => {
      const message = AuthValidator.formatErrorMessage('Untranslated message');
      expect(message).toBe('Untranslated message');
    });
  });
});