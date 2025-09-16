import { BaseValidator } from '@modules/auth/validators/base.validator';
import { body, param, query } from 'express-validator';

export class ProjectsValidator extends BaseValidator {
  static validateCreateProject() {
    return BaseValidator.validate([
      body('project_name').isString().isLength({ min: 1, max: 200 }).withMessage('project_name은 1~200자'),
      body('project_description').optional().isString().isLength({ max: 2000 }),
      body('start_date').isISO8601().withMessage('start_date 형식이 올바르지 않습니다'),
      body('end_date').isISO8601().withMessage('end_date 형식이 올바르지 않습니다'),
      body('member_ids').optional().isArray().withMessage('member_ids는 배열이어야 합니다'),
    ]);
  }

  static validateListProjects() {
    return BaseValidator.validate([
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('status_id').optional().isInt({ min: 1 }),
    ]);
  }

  static validateProjectIdParam() {
    return BaseValidator.validate([
      param('projectId').matches(/^prj_[a-zA-Z0-9]{6,}$/).withMessage('올바른 projectId 형식이 아닙니다'),
    ]);
  }

  static validateProjectTasksQuery() {
    return BaseValidator.validate([
      param('projectId').matches(/^prj_[a-zA-Z0-9]{6,}$/),
      query('status_id').optional().isInt({ min: 1 }),
      query('assignee_id').optional().matches(/^usr_[a-zA-Z0-9]{6,}$/),
    ]);
  }

  static validateUpdateProject() {
    return BaseValidator.validate([
      param('projectId').matches(/^prj_[a-zA-Z0-9]{6,}$/),
      body('project_name').optional().isString().isLength({ min: 1, max: 200 }),
      body('project_description').optional().isString().isLength({ max: 2000 }),
      body('end_date').optional().isISO8601(),
      body('status_id').optional().isInt({ min: 1 }),
      body('progress_rate').optional().isFloat({ min: 0, max: 100 }),
      body('member_ids_to_add').optional().isArray(),
      body('member_ids_to_remove').optional().isArray(),
    ]);
  }

  static validateCreateTaskInProject() {
    return BaseValidator.validate([
      param('projectId').matches(/^prj_[a-zA-Z0-9]{6,}$/),
      body('task_name').isString().isLength({ min: 1, max: 200 }),
      body('task_description').optional().isString().isLength({ max: 2000 }),
      body('assignee_id').matches(/^usr_[a-zA-Z0-9]{6,}$/),
      body('start_date').isISO8601(),
      body('end_date').isISO8601(),
    ]);
  }
}

