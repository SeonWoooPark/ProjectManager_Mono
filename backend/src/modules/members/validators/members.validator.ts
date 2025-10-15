import { BaseValidator } from '@modules/auth/validators/base.validator';
import { query, param, body } from 'express-validator';

export class MembersValidator extends BaseValidator {
  static validateListCompanyMembers() {
    return BaseValidator.validate([
      query('status_id').optional().isInt({ min: 1 }),
      query('role_id').optional().isInt({ min: 1 }),
    ]);
  }

  static validateGetProjectMembers() {
    return BaseValidator.validate([
      param('project_id')
        .matches(/^prj_[a-zA-Z0-9]{6,}$/)
        .withMessage('올바른 프로젝트 ID 형식이 아닙니다 (prj_xxxxxx)')
    ]);
  }

  static validateUpdateStatus() {
    return BaseValidator.validate([
      param('userId')
        .matches(/^usr_[a-zA-Z0-9]{6,}$/)
        .withMessage('올바른 사용자 ID 형식이 아닙니다 (usr_xxxxxx)'),
      body('status_id')
        .isIn([1, 2])
        .withMessage('status_id는 ACTIVE(1) 또는 INACTIVE(2)만 허용됩니다'),
    ]);
  }

  static validateUpdateProfile() {
    return BaseValidator.validate([
      param('userId')
        .matches(/^usr_[a-zA-Z0-9]{6,}$/)
        .withMessage('올바른 사용자 ID 형식이 아닙니다 (usr_xxxxxx)'),
      body().custom((_value, { req }) => {
        const { user_name, phone_number, email } = req.body;
        if (user_name === undefined && phone_number === undefined && email === undefined) {
          throw new Error('업데이트할 필드를 최소 한 개 이상 제공해야 합니다');
        }
        return true;
      }),
      BaseValidator.nameRule('user_name', true),
      body('phone_number')
        .optional({ nullable: true })
        .custom((value) => {
          if (value === null || value === undefined) return true;
          if (typeof value !== 'string') {
            throw new Error('phone_number은 문자열이어야 합니다');
          }
          const trimmed = value.trim();
          if (trimmed.length === 0) {
            return true;
          }
          if (trimmed.length < 10 || trimmed.length > 20) {
            throw new Error('전화번호는 10~20자 사이여야 합니다');
          }
          const phoneRegex = /^[0-9+\-\s()]+$/;
          if (!phoneRegex.test(trimmed)) {
            throw new Error('전화번호는 숫자, +, -, 공백, 괄호만 포함할 수 있습니다');
          }
          return true;
        }),
      BaseValidator.emailRule('email', true),
    ]);
  }
}
