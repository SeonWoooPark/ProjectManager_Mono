import { BaseValidator } from '@modules/auth/validators/base.validator';
import { query } from 'express-validator';

export class MembersValidator extends BaseValidator {
  static validateListCompanyMembers() {
    return BaseValidator.validate([
      query('status_id').optional().isInt({ min: 1 }),
      query('role_id').optional().isInt({ min: 1 }),
    ]);
  }
}

