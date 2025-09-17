import { BaseValidator } from '@modules/auth/validators/base.validator';
import { query, param } from 'express-validator';

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
}

