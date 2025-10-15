import { BaseValidator } from '@modules/auth/validators/base.validator';
import { param, query, body } from 'express-validator';

export class TasksValidator extends BaseValidator {
  static validateListAssigned() {
    return BaseValidator.validate([
      query('status_id').optional().isInt({ min: 1 }),
      query('project_id').optional().matches(/^prj_[a-zA-Z0-9]{6,}$/),
    ]);
  }

  static validateChangeStatus() {
    return BaseValidator.validate([
      param('task_id').matches(/^tsk_[a-zA-Z0-9]{6,}$/),
      body('status_id').isInt({ min: 1 }),
      body('comment').optional().isString().isLength({ max: 1000 }),
    ]);
  }

  static validateUpdateTask() {
    return BaseValidator.validate([
      param('task_id').matches(/^tsk_[a-zA-Z0-9]{6,}$/),
      body('task_name').optional().isString().isLength({ min: 1, max: 200 }),
      body('task_description').optional().isString().isLength({ max: 2000 }),
      body('end_date').optional().isISO8601(),
      body('progress_rate').optional().isFloat({ min: 0, max: 100 }),
      body('assignee_id').optional().matches(/^usr_[a-zA-Z0-9]{6,}$/),
    ]);
  }
}

